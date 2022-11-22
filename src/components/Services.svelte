
<script>
    import { getContext } from 'svelte';
    const services = getContext('services');
</script>


<style>
    #services {
        /* background-color: #2B4257; */
        background: linear-gradient(
      to bottom right,
      rgba(43, 66, 87, 0.85),
      rgba(43, 66, 87, 0.85)
    ),
    url("../assets/scholastic_background.png") center center no-repeat;
        /* background-image: url("../assets/scholastic_background.png"); */
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
    #services h2 {
        text-align: end;
        color: white;
        padding-top: 100px;
        margin-right: 60px;
        font-family: 'Cormorant+Infant', serif;
        font-size: 6rem;
        margin-top: 0px !important;
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
<section id="services">
    <h2>Services</h2>
    <div class="lists-container">

    {#each services as service}
        <div class="individual-list">
            <h3>{service.type}</h3>
            <ul class="services-list">
                {#each service.types as type}
                    <li>{type}</li>
                {/each}
            </ul>

        </div>
    {/each}
</div>

</section>