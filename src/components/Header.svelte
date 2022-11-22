<script>
    // Optional: Function to scroll to the about section
    function scrollToServices() {
      const aboutSection = document.querySelector('#services');
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  </script>
  
<style>
    .background {
        background-image: url("../assets/My_Artistic_Journey.jpg");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        height: 100vh;
        padding: 20px;

    }
    .flex-column {
        display: flex;
        flex-direction: column;
        align-items: start;
    }
    .site-title {
        margin-top: 20vh !important;
        color: white;
        font-family: 'Cormorant+Infant', serif;
        font-size: 10rem;

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
    background-color: white; /* Green background */
    color: black;
    padding: 26px 30px;
    font-size: 20px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 5px;
    animation: flashAnimation 2s infinite;
    animation-timing-function: ease-in-out;
    margin: auto;
  }

  @keyframes flashAnimation {
    0%, 100% { opacity: .9; }
    50% { opacity: 0.5; }
  }
</style>

<section class="background flex-column">
    <h1 class="site-title">
        Paradis <br> Tutoring
    </h1>

    <div class="flex-column sub-header">
        <h3>
            Let your potential unfold
        </h3>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facilis et voluptate, labore nesciunt suscipit enim id voluptatum? Ipsum, veritatis distinctio!
        </p>
    </div>
    <button on:click={scrollToServices} class="flashing-button">My Services</button>
</section>