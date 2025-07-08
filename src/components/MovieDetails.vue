<template>
    <div v-if="movie" class="movie-container">
        <div class="movie-title">{{ movie.name }}</div>
        <div class="movie-info">
            <div>{{ movie.year }}</div>
            <div class="genre-separator">
                <span class="genre-dot">.</span>
                <span class="genre-text">{{ movie.genre.one }}</span>
            </div>
            <div class="genre-separator">
                <span class="genre-dot">.</span>
                <span class="genre-text">{{ movie.genre.two }}</span>
            </div>
            <div class="genre-separator">
                <span class="genre-dot">.</span>
                <span class="genre-text">{{ movie.genre.three }}</span>
            </div>
        </div>
        <div class="movie-description">{{ movie.description }}</div>
    </div>
</template>

<script setup>
    import '../assets/styles/MovieDetails.css';
    defineProps({ movie:Object})
</script>
