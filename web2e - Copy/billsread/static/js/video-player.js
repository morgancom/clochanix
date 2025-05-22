document.addEventListener('DOMContentLoaded', function() {
    const videoContainers = document.querySelectorAll('.video-container');

    videoContainers.forEach(container => {
        const video = container.querySelector('video');
        if (!video) return;

        // Create video controls
        const controls = document.createElement('div');
        controls.className = 'video-controls';
        controls.innerHTML = `
            <button class="play-pause-btn" aria-label="Play">▶</button>
            <div class="progress-bar">
                <div class="progress"></div>
            </div>
            <button class="fullscreen-btn" aria-label="Fullscreen">⤢</button>
        `;
        container.appendChild(controls);

        const playPauseBtn = controls.querySelector('.play-pause-btn');
        const fullscreenBtn = controls.querySelector('.fullscreen-btn');
        const progressBar = controls.querySelector('.progress-bar');
        const progress = controls.querySelector('.progress');

        // Optimize video loading
        video.preload = 'metadata';
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');

        // Handle play/pause
        playPauseBtn.addEventListener('click', () => {
            if (video.paused) {
                video.play().catch(e => console.log('Playback error:', e));
            } else {
                video.pause();
            }
        });

        // Update play/pause button
        video.addEventListener('play', () => {
            playPauseBtn.textContent = '⏸';
            container.classList.remove('loading');
        });

        video.addEventListener('pause', () => {
            playPauseBtn.textContent = '▶';
        });

        // Handle fullscreen
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                container.requestFullscreen().catch(e => console.log('Fullscreen error:', e));
            } else {
                document.exitFullscreen();
            }
        });

        // Update progress bar
        video.addEventListener('timeupdate', () => {
            const percentage = (video.currentTime / video.duration) * 100;
            progress.style.width = `${percentage}%`;
        });

        // Enable seeking
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percentage = (e.clientX - rect.left) / rect.width;
            video.currentTime = video.duration * percentage;
        });

        // Loading states
        video.addEventListener('waiting', () => {
            container.classList.add('loading');
        });

        video.addEventListener('canplay', () => {
            container.classList.remove('loading');
        });

        // Error handling
        video.addEventListener('error', () => {
            console.log('Video error:', video.error);
            container.classList.remove('loading');
            // Try to recover by reloading video
            video.load();
        });

        // Mobile optimization
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'Video Playback',
                artist: 'Clochanix',
                artwork: [
                    { src: '/static/images/logos.png', sizes: '96x96', type: 'image/png' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => video.play());
            navigator.mediaSession.setActionHandler('pause', () => video.pause());
        }
    });
});
