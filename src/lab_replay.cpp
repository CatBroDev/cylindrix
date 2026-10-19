// Old Games Archive, 2026-10-19. Optional bounded, muted input replay.
// Same LGPL terms as Cylindrix. This injects key state, not gameplay results.
#include "lab_replay.h"
#include "system/system.h"
#include <SDL2/SDL.h>
#include <SDL2/SDL_opengl.h>
#include <algorithm>
#include <cstdio>
#include <cstdlib>
#include <vector>

struct Event { unsigned int ms; int key; int down; };
static std::vector<Event> events;
static size_t nextEvent = 0;
static unsigned char held[255] = {};
static unsigned int start, duration, nextSnapshot = 0, nextCapture = 0;
static bool active = false;
static const char* output = nullptr;
extern int g_width, g_height;

bool LabInit() {
    const char* path = SDL_getenv("CYLINDRIX_LAB_REPLAY");
    if (!path) return false;
    FILE* f = fopen(path, "r");
    if (!f) { fprintf(stderr, "LAB: missing input file\n"); exit(2); }
    Event e;
    while (fscanf(f, "%u %d %d", &e.ms, &e.key, &e.down) == 3) {
        if(e.key < 0 || e.key >= SIZEOFKEYTABLE || (e.down != 0 && e.down != 1)) exit(2);
        events.push_back(e);
    }
    fclose(f);
    std::stable_sort(events.begin(), events.end(), [](const Event& a,const Event& b){return a.ms<b.ms;});
    const char* seconds = SDL_getenv("CYLINDRIX_LAB_SECONDS");
    duration = seconds ? atoi(seconds) * 1000 : 20000;
    if(duration < 1000 || duration > 300000) exit(2);
    output = SDL_getenv("CYLINDRIX_LAB_OUTPUT");
    if(!output) exit(2);
    // Null backend advances audio timing without opening a speaker device.
    SDL_setenv("ALSOFT_DRIVERS", "null", 1);
    active = true;
    start = SDL_GetTicks();
    printf("LAB_BEGIN events=%zu duration_ms=%u audio_backend=null\n", events.size(), duration);
    return true;
}

bool LabActive() { return active; }

void LabKeys(unsigned char* down, unsigned char* pressed) {
    if(!active) return;
    const unsigned int ms = SDL_GetTicks() - start;
    while(nextEvent < events.size() && events[nextEvent].ms <= ms) {
        const Event& e = events[nextEvent++]; held[e.key] = e.down;
        printf("LAB_KEY ms=%u key=%d down=%d\n", ms, e.key, e.down);
    }
    for(int i=0;i<SIZEOFKEYTABLE;++i) {
        pressed[i] = held[i] && !down[i]; down[i] = held[i];
    }
}

bool LabTick() {
    if(!active) return false;
    const unsigned int ms = SDL_GetTicks() - start;
    if(ms >= nextSnapshot) { LabGameSnapshot(ms); nextSnapshot = ms+250; fflush(stdout); }
    // Prevent the unthrottled original menu loop from consuming a CPU core.
    SDL_Delay(1);
    return ms >= duration;
}

void LabCapture() {
    if(!active) return;
    const unsigned int ms = SDL_GetTicks() - start;
    if(ms < nextCapture) return;
    nextCapture = ms + 2000;
    int width=0,height=0;
    GLint viewport[4]; glGetIntegerv(GL_VIEWPORT, viewport); width=viewport[2];height=viewport[3];
    if(width <= 0 || height <= 0 || width > 4096 || height > 4096) return;
    std::vector<unsigned char> pixels(width*height*3);
    glPixelStorei(GL_PACK_ALIGNMENT,1);
    glReadPixels(0,0,width,height,GL_RGB,GL_UNSIGNED_BYTE,pixels.data());
    char path[1024]; snprintf(path,sizeof(path),"%s/frame-%06u.ppm",output,ms);
    FILE* f=fopen(path,"wb"); if(!f) return;
    fprintf(f,"P6\n%d %d\n255\n",width,height);
    for(int y=height-1;y>=0;--y) fwrite(pixels.data()+y*width*3,1,width*3,f);
    fclose(f);
}

void LabShutdown() { if(active) printf("LAB_END elapsed_ms=%u\n",SDL_GetTicks()-start); }
