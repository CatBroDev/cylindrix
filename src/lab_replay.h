// Old Games Archive, 2026-10-19. Optional diagnostic code; same LGPL terms
// as the surrounding Cylindrix source. Never enabled in a release by default.
#pragma once
bool LabInit();
bool LabActive();
void LabKeys(unsigned char* down, unsigned char* pressed);
bool LabTick();
void LabCapture();
void LabShutdown();
void LabGameSnapshot(unsigned int milliseconds);
