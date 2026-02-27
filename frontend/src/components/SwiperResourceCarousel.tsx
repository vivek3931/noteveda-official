'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode, Mousewheel } from 'swiper/modules';
import { ChevronRightIcon } from '@/components/icons';
import { Resource } from '@/types';
import { ResourceCard } from '@/components/features';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

interface SwiperResourceCarouselProps {
    resources: Resource[];
    onDelete?: (resource: Resource) => void;
}

const SwiperResourceCarousel: React.FC<SwiperResourceCarouselProps> = ({ resources, onDelete }) => {
    return (
        <div className="relative group/carousel">
            {/* Custom Navigation Buttons */}
            <div className="hidden lg:block">
                <button className="swiper-button-prev-custom absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0 text-gray-700 dark:text-gray-300 hover:scale-110">
                    <ChevronRightIcon size={24} className="rotate-180" />
                </button>
                <button className="swiper-button-next-custom absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0 text-gray-700 dark:text-gray-300 hover:scale-110">
                    <ChevronRightIcon size={24} />
                </button>
            </div>

            <Swiper
                modules={[Navigation, FreeMode, Mousewheel]}
                spaceBetween={16}
                // Default to 1 if no breakpoint matches (though breakpoints cover all)
                slidesPerView={1.2}
                freeMode={true}
                mousewheel={{
                    forceToAxis: true,
                    sensitivity: 0.5
                }}
                navigation={{
                    prevEl: '.swiper-button-prev-custom',
                    nextEl: '.swiper-button-next-custom',
                }}
                breakpoints={{
                    // Small screens: 2-3 cards depending on width
                    320: {
                        slidesPerView: 1.2,
                        spaceBetween: 16
                    },
                    480: {
                        slidesPerView: 2.2,
                        spaceBetween: 16
                    },
                    // Medium screens: 3 cards
                    640: {
                        slidesPerView: 3.2,
                        spaceBetween: 16
                    },
                    // Large screens: Match Browse (4-5 columns equivalent)
                    1024: {
                        slidesPerView: 4.2,
                        spaceBetween: 20
                    },
                    1280: {
                        slidesPerView: 5,
                        spaceBetween: 20
                    }
                }}
                className="w-full !px-1 !py-4"
            >
                {resources.map((resource, index) => (
                    <SwiperSlide key={resource.id} className="!w-auto !h-auto d-flex">
                        {/* 
                            Slide width is defined here. 
                            Mobile: 280px
                            Tablet: 300px
                            Desktop: 320px
                            This matches the user's request for fixed dimensions similar to Browse page logic.
                        */}
                        <div className="w-[280px] sm:w-[300px] lg:w-[320px] h-full">
                            <ResourceCard resource={resource} index={index} onDelete={onDelete ? () => onDelete(resource) : undefined} />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default SwiperResourceCarousel;
