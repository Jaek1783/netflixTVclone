<template>
    <div class="carousel-wrapper">
        <div class="category-header">
            <div class="category-title">
                {{ category }}
            </div>
        </div>
        <Carousel
            ref="carousel"
            v-model="currentSlide"
            :items-to-show="8"
            :items-to-scroll="1"
            :wrap-around="true"
            :transition="500"
            snapAlign="start"
            class="carousel"
        >
            <Slide
                v-for="slide, index in movies"
                :key="slide"
                class="slide-item"
            >
                <div
                    @click="$event=>fullScreenVideo(index)"
                    @mouseenter="updatePreview(slide)"
                    @mouseleave="resetPreview"
                    class="slide-content"
                    :class="{
                        'selected': currentSlide === index,
                        'not-selected': currentSlide !== index
                    }"
                >
                    <img
                        class="slide-image"
                        :src="'/images/'+slide.name+'.png'"
                    />
                </div>
            </Slide>
            <template #addons>
                <Navigation/>
            </template>
        </Carousel>
    </div>
</template>

<script setup>
import {ref, toRefs} from 'vue';
import 'vue3-carousel/dist/carousel.css';
import '../assets/styles/VideoCarousel.css';
import { Carousel, Slide, Navigation } from 'vue3-carousel';

import { useMovieStore } from '@/stores/movie';
import { storeToRefs } from 'pinia';
    const useMovie = useMovieStore();
    const {movie, showFullVideo} = storeToRefs(useMovie);

    let currentSlide = ref(0);
    let originalMovie = ref(null);

    const props = defineProps({category : String , movies : Array})
    const {movies, category } = toRefs(props);

    const updatePreview = (slide) => {
        if (!originalMovie.value) {
            originalMovie.value = movie.value;
        }
        movie.value = slide;
    }

    const resetPreview = () => {
        if (originalMovie.value) {
            movie.value = originalMovie.value;
            originalMovie.value = null;
        }
    }

    const fullScreenVideo = (index) => {
        currentSlide.value = index;
        originalMovie.value = movies.value[index];
        movie.value = movies.value[index];
        setTimeout(() => showFullVideo.value = true, 500);
    }
</script>