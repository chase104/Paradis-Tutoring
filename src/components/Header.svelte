<script>
    function scrollToServices() {
      const aboutSection = document.querySelector('#services');
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
    function handleKeyPress(event) {
    if (event.key === 'Enter' || event.key === 'Space') {
        scrollToServices();
        event.preventDefault(); 
    }
}
  </script>


<section class="background flex-column">
    <h1 class="site-title">
        Paradis <span>Tutoring</span>
    </h1>

    <div class="flex-column sub-header">
        <h3 class="site-subtitle">
            Let your potential unfold
        </h3>
        <p>
            At Paradis Tutoring, we're committed to helping you excel in all aspects of English and communication. Led by Mr. Paradis, a seasoned educator with over 10 years of experience across multiple continents, our tutoring services are designed to boost your abilities and confidence in professional writing, SAT preparation, literary analysis, and public speaking.
        </p>
    </div>
    <button on:click={scrollToServices}     on:keypress={handleKeyPress}
     class="flashing-button" aria-label="Learn more about my tutoring services">My Services</button>
</section>

  
<style>
    .background {
        background-image: url("../assets/My_Artistic_Journey.jpg");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        height: 100vh;
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .flex-column {
        display: flex;
        flex-direction: column;
        align-items: start;
    }
    .site-title {
        color: white;
        font-family: 'Cormorant+Infant', serif;
        font-size: 10rem;
        margin: 0px !important

    }
    .site-title span {
        display: block;
    }
    .sub-header {
        color: white;
        margin-left: 40px;
    }
    .sub-header h3 {
        font-size: 2rem;
        letter-spacing: 1px;
    }
    .flashing-button {
    background-color: white;
    color: black;
    padding: 26px 30px;
    font-size: 20px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 5px;
    animation: flashAnimation 2s infinite;
    animation-timing-function: ease-in-out;
    margin: 12px auto;
  }

  @keyframes flashAnimation {
    0%, 100% { opacity: .9; }
    50% { opacity: 0.5; }
  }
</style>