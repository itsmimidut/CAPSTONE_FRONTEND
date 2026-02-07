<template>
  <section class="py-12 bg-neutral-gray text-center">
    <h2 class="text-3xl font-bold mb-4 gradient-border section-head-center">Welcome to Eduardo's Resort Website</h2>
    <div class="max-w-5xl mx-auto px-4">
      <h3 class="text-xl font-bold mb-4 text-left">The Company</h3>
      <div class="clearfix">
        <figure class="float-right w-40 sm:w-48 md:w-56 ml-6 mb-4">
          <div class="rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop&q=80"
              alt="Eduardo's Resort scenic view"
              class="w-full h-auto"
              loading="lazy"
            />
          </div>
        </figure>
        <p class="text-gray-700 mb-10 text-justify text-left">
          Eduardo's Resort Corporation founded by Dr. Elizalde M. Herrera located at Nautical Highway Bayanan II, Calapan City Oriental Mindoro which started operation on September 8, 2013. It complies with the mandate of and operates under the Philippine laws. Eduardo's Resort promotes tourism in the province, provides employment to local residents, helps the farmers maximize product of agricultural crops and supports swimmers and athletes. Establishment of Eduardo's Resort Swimming Foundation, Inc. aims to promote swimming as primary sports in Oriental Mindoro and the rest of MIMAROPA Region; to provide excellent training, state-of-the-art competition, facility and other athletic support to members and beneficiaries of the foundation; to extend pool access and swimming lesson for individuals who are eager and passionate to learn the sport of swimming; to create programs, incentives and scholarships opportunities for competitive swimmers, coaches and officials; to establish strong partnership and linkage with local, national and international both private and government which can provide opportunities for the members and beneficiaries of the foundation.
        </p>
      </div>
    </div>
    <div class="px-12 flex flex-row justify-center gap-20">
    </div>
  </section>
</template>

<style scoped>
.gradient-border {
  position: relative;
}
.gradient-border::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(to right, #2B6CB0, #C19A6B);
  border-radius: 3px;
}
.section-head-center::after {
  left: 50%;
  transform: translateX(-50%);
}
.clearfix::after {
  content: '';
  display: block;
  clear: both;
}
</style>