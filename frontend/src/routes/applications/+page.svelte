<script>
    function openGroupModal(){
        alert("open group modal");
        //TODO: create group modal
    }
    let users = [
        {
            name: "John",
            group: "group1",
            email: "john@",
            password: "123456",
            active: true
        }
    ]
</script>

<div class="container">
    <div class="top-bar">
        <h1>Applications</h1>
        <button on:click={openGroupModal}>+ GROUP</button>
    </div>
    <div class="user-table">
        <table>
            <th>Name</th>
            <th>Group</th>
            <th>Email</th>
            <th>Group</th>
            <th>Password</th>
            <th>Active</th>
            <th>Action</th>

            <tr>
                <td colspan=7>
                    <input type="text" placeholder="name">
                    <input type="text" placeholder="email">
                    <input type="text" placeholder="group">
                    <input type="text" placeholder="email">
                    <input type="text" placeholder="password">
                    <input type="checkbox">
                    <button>+</button>
                </td>
            </tr>

            {#each users as user}
                <tr>
                    <td>{user.name}</td>
                    <td>{user.group}</td>
                    <td>{user.email}</td>
                    <td>{user.group}</td>
                    <td>{user.password}</td>
                    <td>{user.active}</td>
                    <td>
                        <button>Edit</button>
                        <button>Save Changes</button>
                        <button>Cancel</button>
                    </td>
            {/each}
        </table>
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: auto;
    }

    .top-bar {
        display: flex;
        justify-content: space-between;
        margin: 20px;
    }


    button {
        padding: 10px;
        color: white;
        background-color: black;
        border: none;
        cursor: pointer;
    }

    button:hover {
        background-color: rgba(0,0,0,0.8);
    }
    button:active {
        background-color: rgba(0,0,0,0.5);
    }
    
    table {
        display: grid;
        grid-template-columns: repeat(7,1fr);
        margin: auto;
        grid-gap: 10px;
    }

    th, td {
        grid-column: span 1;
        width: 100%;
    }

    input[type="text"], input[type="email"]{
        grid-column: span 1;
        width: 100%;
    }



    
</style>