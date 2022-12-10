<script>
    import { getContext } from 'svelte';
    const services = getContext('services');
    import { clickedTopic } from '../store.js';
    let flipped = [false, false, false]

    const toggleFlip = (index) =>  {
        flipped[index] = !flipped[index];
    }
    const handleLiClick = (e) => {
        // jump to #contact section and stop propagation
        e.stopPropagation();
        clickedTopic.set(e.target.innerText)
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    }
    </script>

<section id="services" class="page-padding">
    <h2 class="section-title">Services</h2>
    <div class="lists-container">
        {#each services as service, index}
            <div class="card" class:card-clicked={flipped[index]} on:click={() => toggleFlip(index)}>
                <div class={`card-inner ${flipped[index] ? 'is-flipped' : ''}`}>
                    <div class="card-front individual-list">
                        <h3>{service.type}</h3>
                        <ul class="services-list">
                            {#each service.types as type}
                                <!-- <li on:click={handleLiClick}>{type}</li> -->
                                <li>{type}</li>
                            {/each}
                        </ul>
                    </div>
                    <div class="card-back">
                        <h3>{service.type}</h3>

                        <p>{service.description}</p> <!-- Example: add description or other details here -->
                    </div>
                </div>
            </div>
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
        min-height: 105vh;
    }
    .services-list {
        list-style-type: none;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        
    }


    .lists-container {
        gap: 20px;
        display: flex;
        justify-content: space-between;
        margin: auto;
    
    }
    .individual-list {
        padding: 20px;
        color: black;
        background-color: #E0DFD8;
        border-radius: 5px;
        width: 300px;
        cursor: pointer;   
        transition: 0.2s;
    }
    .individual-list:hover {
        transform: scale(1.05);
    }
    .individual-list h3, .card-back h3 {
        font-size: 2rem;
        margin-bottom: 10px;
    }
    .individual-list li{
        font-size: 1.5rem;
        margin-bottom: 5px;
        transition: 0.2s;
        padding: 4px;
    }
    .individual-list li:hover {
    transform: scale(1.05); 
    margin-left: 4px;

    
    }
    .card {
    perspective: 1000px;
    width: 300px;
    height: 350px;
    margin-bottom: 20px;
}
.card-inner {
    width: 100%;
    height: 100%;
    background-color: #E0DFD8;
    transition: transform 0.8s;
    transform-style: preserve-3d;
    position: relative;
}
.card-clicked .card-inner {
    transform: rotateY(180deg);
}
/* .card:hover .card-inner {
    transform: rotateY(180deg);
} */
.card-front, .card-back {
    width: 100%;
    height: 100%;
    flex-direction: column;
    backface-visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
    padding: 20px;
    background: #E0DFD8;

}
.card-front {
    z-index: 2;
}
.card-back {
    align-items: start !important;
    justify-content: start !important;
    color: black;
    cursor: pointer;
    transform: rotateY(180deg);
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>