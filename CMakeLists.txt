# use vcpkg to download and build dependencies
set(CMAKE_TOOLCHAIN_FILE "${CMAKE_CURRENT_SOURCE_DIR}/vcpkg/scripts/buildsystems/vcpkg.cmake" CACHE STRING "Vcpkg toolchain file")

cmake_minimum_required(VERSION 3.13 FATAL_ERROR)
set(PROJECT_NAME cylindrix)
project(${PROJECT_NAME} LANGUAGES C CXX)

if(EMSCRIPTEN)
    # OGA 2026-10-19: reuse the pinned libyaml source from the native build.
    if(NOT CYLINDRIX_YAML_SOURCE OR NOT CYLINDRIX_WEB_ASSETS)
        message(FATAL_ERROR "Set CYLINDRIX_YAML_SOURCE and CYLINDRIX_WEB_ASSETS")
    endif()
    set(BUILD_TESTING OFF CACHE BOOL "" FORCE)
    set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
    add_subdirectory(${CYLINDRIX_YAML_SOURCE} ${CMAKE_CURRENT_BINARY_DIR}/yaml)
    # vcpkg's Windows host patch renames strdup; the WASM libc uses POSIX strdup.
    target_compile_definitions(yaml PRIVATE _strdup=strdup)
    set(CYLINDRIX_SOUND_SOURCE src/system/openal/sound.cpp)
else()

# opengl
find_package(OpenGL REQUIRED)
include_directories(${GL_INCLUDE_DIRS})

# sdl2
find_package(SDL2 CONFIG REQUIRED)

# glew
find_package(GLEW REQUIRED)

# glm
find_package(glm CONFIG REQUIRED)

# openal-soft
find_package(OpenAL CONFIG REQUIRED)

# lib123
find_package(mpg123 CONFIG REQUIRED)

# libyaml
find_package(yaml CONFIG REQUIRED)
set(CYLINDRIX_SOUND_SOURCE src/system/openal/sound.cpp)
endif()

add_compile_definitions(GLCYLINDRIX)

# src
include_directories(src)
add_executable(${PROJECT_NAME}
    src/ai.cpp
    src/ai_move.cpp
    src/ai_util.cpp
    src/base.cpp
    src/clipping.cpp
    src/collide.cpp
    src/commands.cpp
	src/config.cpp
    src/do_state.cpp
    src/energy.cpp
    src/events.cpp
    src/explode.cpp
    src/fli.cpp
    src/fx.cpp
    src/gameloop.cpp
    # Old Games Archive, 2026-10-19: the desktop SDL context requires the
    # existing desktop GL renderer; the GLES renderer is unfinished.
    src/glcylindrix.cpp
	src/hud.cpp
    src/jonsb.cpp
    src/keys.cpp
    src/level.cpp
    src/main.cpp
    src/menu.cpp
    src/motor.cpp
	src/movement.cpp
    src/object.cpp
    src/omega.cpp
    src/path.cpp
    src/pcx.cpp
    src/prim.cpp
    src/project.cpp
    src/pylon.cpp
	src/radar.cpp
    src/states.cpp
    src/stats.cpp
    src/stub.cpp
    src/tanks.cpp
    src/text.cpp
	src/util.cpp
    src/voices.cpp
    src/system/sdl/system.cpp
    ${CYLINDRIX_SOUND_SOURCE}
)

target_compile_features(${PROJECT_NAME} PRIVATE cxx_std_17)
option(CYLINDRIX_LAB "Enable bounded, silent input replay and evidence capture" OFF)
if(CYLINDRIX_LAB)
    target_compile_definitions(${PROJECT_NAME} PRIVATE CYLINDRIX_LAB)
    target_sources(${PROJECT_NAME} PRIVATE src/lab_replay.cpp)
endif()
if(MSVC)
    target_compile_definitions(${PROJECT_NAME} PRIVATE _CRT_SECURE_NO_WARNINGS _USE_MATH_DEFINES)
endif()


if(EMSCRIPTEN)
    target_compile_definitions(${PROJECT_NAME} PRIVATE BROWSER)
    option(CYLINDRIX_WEB_PREVIEW "Limit the browser preview to custom matches" OFF)
    if(CYLINDRIX_WEB_PREVIEW)
        target_compile_definitions(${PROJECT_NAME} PRIVATE CYLINDRIX_WEB_PREVIEW)
    endif()
    target_compile_options(${PROJECT_NAME} PRIVATE -sUSE_SDL=2)
    target_link_libraries(${PROJECT_NAME} PRIVATE yaml openal)
    target_link_options(${PROJECT_NAME} PRIVATE
        # The FFP-only fast path submits unused texture attributes beyond the
        # browser's MAX_VERTEX_ATTRIBS. Use the checked compatibility path.
        -sUSE_SDL=2 -sLEGACY_GL_EMULATION=1 -sGL_FFP_ONLY=0 -sGL_UNSAFE_OPTS=0
        -sALLOW_MEMORY_GROWTH=1 -sSTACK_SIZE=2097152 -sASSERTIONS=1
        -sEXPORTED_RUNTIME_METHODS=ccall,FS
        --preload-file "${CYLINDRIX_WEB_ASSETS}@/"
    )
    set_target_properties(${PROJECT_NAME} PROPERTIES SUFFIX ".js")
else()
target_link_libraries(${PROJECT_NAME} PRIVATE
    ${OPENGL_LIBRARIES}
    $<TARGET_NAME_IF_EXISTS:SDL2::SDL2main>
    $<IF:$<TARGET_EXISTS:SDL2::SDL2>,SDL2::SDL2,SDL2::SDL2-static>
    GLEW::GLEW
    glm::glm
    yaml
    OpenAL::OpenAL
    MPG123::libmpg123
)
endif()

if(SHIPPING)
    add_compile_definitions(SHIPPING)

    # Copy required data directories to the executable directory
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
                ${CMAKE_SOURCE_DIR}/font
                $<TARGET_FILE_DIR:${PROJECT_NAME}>/font
        COMMAND ${CMAKE_COMMAND} -E copy_directory
                ${CMAKE_SOURCE_DIR}/shader
                $<TARGET_FILE_DIR:${PROJECT_NAME}>/shader
        COMMAND ${CMAKE_COMMAND} -E copy_directory
                ${CMAKE_SOURCE_DIR}/texture
                $<TARGET_FILE_DIR:${PROJECT_NAME}>/texture
        COMMAND ${CMAKE_COMMAND} -E copy
                ${CMAKE_SOURCE_DIR}/data/test.ply
                $<TARGET_FILE_DIR:${PROJECT_NAME}>/data/test.ply
    )
endif()
