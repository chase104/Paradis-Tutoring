
<script>
    import { getContext } from 'svelte';
    const services = getContext('services');
    import {clickedTopic} from '../store.js';
    function scrollToContact() {
      const aboutSection = document.querySelector('#contact');
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
    let handleTypeClick = (type) => {
        clickedTopic.set(type);
    }
    function handleKeyPress(event) {
    if (event.key === 'Enter' || event.key === 'Space') {
      handleTypeClick(event.target.innerText);
    }
}
</script>



<section id="services">
    <h2 class="section-title">Services</h2>
    <div class="lists-container">

    {#each services as service}
        <section class="individual-list" on:click={() => scrollToContact()}>
            <h3>{service.type}</h3>
            <ul class="services-list">
                {#each service.types as type}
                    <li on:click={() => handleTypeClick(type)} on:keypress={handleKeyPress}>{type}</li>
                {/each}
            </ul>

        </section>
    {/each}
</div>

</section>

<style>
    #services {
        background: linear-gradient(
      to bottom right,
      rgba(43, 66, 87, 0.85),
      rgba(43, 66, 87, 0.85)
    ),
    url("../assets/scholastic_background.png");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        color: white;
        min-height: 100vh;
    }
    .services-list {
        list-style-type: none;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        
    }


    .lists-container {
        display: flex;
        justify-content: space-around;
        padding: 20px;
        max-width: 1300px;
        margin: auto;
    
    }
    .individual-list {
        padding: 20px;
        margin: 20px;
        color: black;
        background-color: #E0DFD8;
        border-radius: 5px;
        width: 300px;
        transition: 0.5s;
        cursor: pointer;   
    }
    .individual-list:hover {
        transform: scale(1.05);
    }
    .individual-list h3 {
        font-size: 2rem;
        margin-bottom: 10px;
    }
    .individual-list li {
        font-size: 1.5rem;
        margin-bottom: 5px;
        transition: 0.2s;
        padding: 4px;
    }
    .individual-list li:hover {
    transform: scale(1.05); 
    margin-left: 4px;

    
    }
</style>