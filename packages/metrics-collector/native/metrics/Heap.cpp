#include <string>
#include <vector>
#include <v8.h>

#include "Heap.hpp"

namespace lightstep {
  void Heap::inject(Object carrier) {
    v8::Isolate *isolate = v8::Isolate::GetCurrent();
    Object heap;
    std::vector<Object> spaces;

    for (unsigned int i = 0; i < isolate->NumberOfHeapSpaces(); i++) {
      Object space;
      v8::HeapSpaceStatistics stats;

      if (isolate->GetHeapSpaceStatistics(&stats, i)) {
        space.set("spaceName", std::string(stats.space_name()));
        space.set("spaceSize", stats.space_size());
        space.set("spaceUsedSize", stats.space_used_size());
        space.set("spaceAvailableSize", stats.space_available_size());
        space.set("physicalSpaceSize", stats.physical_space_size());

        spaces.push_back(space);
      }
    }

    heap.set("spaces", spaces);
    carrier.set("heap", heap);
  }
}
