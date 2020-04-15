#pragma once

#include "Collector.hpp"
#include "Object.hpp"

namespace lightstep {
  class Heap : public Collector {
    public:
      void inject(Object carrier);
  };
}
