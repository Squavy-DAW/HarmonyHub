cmake_minimum_required(VERSION 3.26)
project(HarmonyHub)

set(CMAKE_CXX_STANDARD 23)

# Add source files
file(GLOB_RECURSE SrcFiles "server/*")
add_executable(HarmonyHub main.cpp ${SrcFiles})

# Copy assets
file(COPY res DESTINATION ${CMAKE_BINARY_DIR})

# Add libraries
find_package(PkgConfig REQUIRED)
include(FetchContent)

target_link_libraries(HarmonyHub PUBLIC
        # add libraries here
)