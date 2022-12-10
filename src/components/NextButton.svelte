<script>
    export let target;
    export let theme;
    console.log(target);
        const  scrollToServices = () =>  {
            console.log(target);
      const aboutSection = document.querySelector(target);
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
    const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === 'Space') {
        scrollToServices();
        event.preventDefault(); 
    }
}
</script>

<button on:click={scrollToServices}     on:keypress={handleKeyPress}
class="flashing-button" class:dark={theme==="dark"} aria-label="Learn more about my tutoring services">▼</button>

<style>
      .flashing-button {
    background-color: white;
    color: black;
    padding: 26px 30px;
    height: 80px;
    font-size: 20px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 50px;
    grid-column: span 2;
    animation: flashAnimation 2s infinite;
    animation-timing-function: ease-in-out;
    margin: 0 auto;
    margin-top: 30px;
  }
  .dark {
    background-color: black;
    color: white;
  
  }
  @keyframes flashAnimation {
    0%, 100% { opacity: .9; }
    50% { opacity: 0.5; }
  }
</style>