<script setup>
import { onMounted, ref } from 'vue';
import movies from './movies.json';
import './assets/styles/App.css';

import Magnify from 'vue-material-design-icons/Magnify.vue'
import HomeOutline from 'vue-material-design-icons/HomeOutline.vue'
import TrendingUp from 'vue-material-design-icons/TrendingUp.vue'
import Television from 'vue-material-design-icons/Television.vue'
import MovieOutline from 'vue-material-design-icons/MovieOutline.vue'
import Plus from 'vue-material-design-icons/Plus.vue'
import ChevronLeft from 'vue-material-design-icons/ChevronLeft.vue'

import VideoCarousel from '@/components/VideoCarousel.vue'
import MovieDetails from '@/components/MovieDetails.vue'

import {useMovieStore} from './stores/movie'
import { storeToRefs } from 'pinia';
const useMovie = useMovieStore();
const {movie, showFullVideo} = storeToRefs(useMovie);

onMounted(()=>{
  setTimeout(()=>movie.value = movies[0][0] ,100)
})
</script>

<template>
    <div class="app-container">
      <div v-if="!showFullVideo" id="SideNav" class="side-nav">
        <img class="netflix-logo" src="/images/netflix-logo.png" alt="넷플릭스 로고">
        <div>
          <div class="nav-item">
            <Magnify fillColor="#fff" :size="40" class="cursor-pointer"/>
          </div>
          <div class="nav-item active">
            <HomeOutline fillColor="#fff" :size="40" class="cursor-pointer"/>
          </div>
          <div class="nav-item">
            <TrendingUp fillColor="#fff" :size="40" class="cursor-pointer"/>
          </div>
          <div class="nav-item">
            <Television fillColor="#fff" :size="40" class="cursor-pointer"/>
          </div>
          <div class="nav-item">
            <MovieOutline fillColor="#fff" :size="40" class="cursor-pointer"/>
          </div>
          <div class="nav-item">
            <Plus fillColor="#fff" :size="40" class="cursor-pointer"/>
          </div>
        </div>
      </div>
      <div v-if="!showFullVideo">
        <div class="main-video-container">
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
        <div class="carousel-container">
          <VideoCarousel class="carousel-section" category="Popular Movies" :movies="movies[0]"/>
          <VideoCarousel class="carousel-section" category="Horror Movies" :movies="movies[1]"/>
          <VideoCarousel class="carousel-section last" category="Featured Movies" :movies="movies[2]"/>
        </div>
      </div>

      <div v-if="!showFullVideo" class="bottom-gradient"/>
      <div v-if="showFullVideo">
        <div @click="$event=> showFullVideo = false" class="back-button">
          <ChevronLeft fillColor="#fff" :size="40"/>
        </div>
        <video
          v-if="movie"
          :src="'/videos/'+movie.name+'.mp4'"
          autoplay
          loop
          controls
          class="fullscreen-video"
        />
      </div>
    </div>
</template>
