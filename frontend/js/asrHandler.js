class ASRHandler {
    constructor() {
        this.audioUpload = document.getElementById('audio-upload');
        this.recordAudioBtn = document.getElementById('record-audio');
        this.audioControls = document.getElementById('audio-controls');
        this.audioPlayer = document.getElementById('audio-player');
        this.transcribeBtn = document.getElementById('transcribe-btn');
        this.transcriptionBox = document.getElementById('transcription');
        this.transcriptionText = document.getElementById('transcription-text');

        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];

        this.init();
    }

    init() {
        this.audioUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        this.recordAudioBtn.addEventListener('click', () => this.toggleRecording());
        this.transcribeBtn.addEventListener('click', () => this.transcribeAudio());
    }

    showLoadingIndicator() {
        document.getElementById('loading-indicator').classList.remove('hidden');
    }
    
    hideLoadingIndicator() {
        document.getElementById('loading-indicator').classList.add('hidden');
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const audioURL = URL.createObjectURL(file);
            this.audioPlayer.src = audioURL;
            this.audioControls.classList.remove('hidden');
        }
    }

    async toggleRecording() {
        if (!this.isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.mediaRecorder = new MediaRecorder(stream);
                this.mediaRecorder.ondataavailable = (e) => {
                    this.audioChunks.push(e.data);
                };
                this.mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    this.audioPlayer.src = audioUrl;
                    this.audioControls.classList.remove('hidden');
                };
                this.mediaRecorder.start();
                this.isRecording = true;
                this.recordAudioBtn.textContent = 'Stop Recording';
                this.recordAudioBtn.classList.add('recording');
            } catch (err) {
                console.error('Error accessing microphone:', err);
                alert('Failed to access microphone. Please ensure you have given permission and try again.');
            }
        } else {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.recordAudioBtn.textContent = 'Record Audio';
            this.recordAudioBtn.classList.remove('recording');
            this.audioChunks = [];
        }
    }

    async transcribeAudio() {
        const audioBlob = await fetch(this.audioPlayer.src).then(r => r.blob());
        this.showLoadingIndicator();
        try {
            const audioArrayBuffer = await audioBlob.arrayBuffer();
            const audioFloat32Array = new Float32Array(audioArrayBuffer);
            
            const sampleRate = 16000; 

            const inputData = {
                speech_array: Array.from(audioFloat32Array), // Convert to regular array for JSON serialization
                sampling_rate: sampleRate
            };

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inputData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.transcriptionText.textContent = data;
            this.transcriptionBox.classList.remove('hidden');
        } catch (error) {
            console.error('Error transcribing audio:', error);
            alert('Failed to transcribe audio. Please try again later.');
        } finally {
            this.hideLoadingIndicator();
        }
    }
}

export default ASRHandler;