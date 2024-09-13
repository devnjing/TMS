<script>
  import { goto } from '$app/navigation';
  import {login} from "$api";
  
  let username;
  let password;

  async function handleLogin () {
    const response = await login(username,password);
    if(response.data.success){
      goto('/applications');
    }
  }
</script>

<div class="login-container">
  <div class="login-box">
    <h1>LOGIN</h1>
    <form on:submit|preventDefault={handleLogin}>
      <div class="field">
        <input type="text" id="username" bind:value={username} placeholder="Username" />
      </div>
      <div class="field">
        <input type="password" id="password" bind:value={password}  placeholder="Password"/>
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
</div>

<style>

  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  h1 {
    font-weight: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .login-box {
    align-items: center;
    padding: 20px;
    width: 33vh;
  }

  .field {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    background-color: #D3D3D3;
  }

  input[type="text"], input[type="password"] {
    width: 100%;
    border: none;
    outline: none;
    background-color: #D3D3D3;
  }

  button[type="submit"] {
    width: 100%;
    background-color: #000000;
    color: #fff;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
</style>