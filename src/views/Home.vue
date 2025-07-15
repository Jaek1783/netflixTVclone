<template>
  <div class="page-content">
    <div class="main-video-container" :style="{ left: navWidth }">
      <div class="gradient-overlay"/>
      <MovieDetails v-if="movie" :movie="movie"/>
      <video
        v-if="movie"
        :src="'/videos/'+movie.name+'.mp4'"
        autoplay
        loop
        class="video-preview"
      />
    </div>
    <div class="carousel-container" :style="{ left: navWidth }">
      <VideoCarousel class="carousel-section" category="Popular Movies" :movies="movies[0]"/>
      <VideoCarousel class="carousel-section" category="Horror Movies" :movies="movies[1]"/>
      <VideoCarousel class="carousel-section last" category="Featured Movies" :movies="movies[2]"/>
    </div>
  </div>
</template>

<script setup>
import { onMounted, inject } from 'vue'
import movies from '../movies.json'
import VideoCarousel from '../components/VideoCarousel.vue'
import MovieDetails from '../components/MovieDetails.vue'
import { useMovieStore } from '../stores/movie'
import { storeToRefs } from 'pinia'
import '@/assets/styles/Home.css'

const useMovie = useMovieStore()
const { movie } = storeToRefs(useMovie)

// 네비게이션 바 너비 받아오기
const navWidth = inject('navWidth')

onMounted(() => {
  setTimeout(() => movie.value = movies[0][0], 100)
})
</script> 