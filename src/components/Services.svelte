
<script>
    let services = [
        {type: "English",  types: [
            "Beginner Classes", "Intermediate Classes", "Advanced Classes", "Business English", "Conversation Classes",
        ]},
        {type: "Exam Preparation",types: [
            "IELTS", "TOEFL", "TOEIC", "Cambridge English Exams", "SAT", 
        ]},
        {type: "Academic Tutoring", types: [
            "Mathematics", "Science", "History", "Geography", "Literature", "Writing", "Research", "Study Skills",
        ]},
    ]
</script>


<style>
    #services {
        background-color: #2B4257;
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