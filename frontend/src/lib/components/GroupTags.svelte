<script>
	import { onMount } from "svelte";
  import Dropdown from "./Dropdown.svelte";
  import {api} from '$api';

  export let selected = [];
  export let editTags = false;
  let options = [];

  onMount(async () => {
    try {
		const response = await api.get('/api/groups', { withCredentials: true });
		options = response.data;
	} catch (error) {
		if (error.status === 401) {
			goto('/login');
		}
		toast.error(error.response.data.error);
	}
  })


  $: reactiveSelected = selected;

  

  function removeTag(tag) {
    selected = selected.filter(t => t !== tag);
  }

  async function refreshOptions() {
    try {
		const response = await api.get('/api/groups', { withCredentials: true });
		options = response.data;
	} catch (error) {
		if (error.status === 401) {
			goto('/login');
		}
		toast.error(error.response.data.error);
	}
  }

</script>

<div class="tags-container">

  {#if editTags}
    <div class="select-tags">
      <Dropdown {options} bind:selected={selected} on:open={() => (refreshOptions())} on:close={() => (isOpen = false)}/>
    </div>
  {/if}
  {#each reactiveSelected as tag}
  <span class="tag">
    {tag}
    {#if editTags}
      <button class="remove-tag" on:click={() => removeTag(tag)}>x</button>
    {/if}
  </span>
  {/each}

</div>

<style>
  .select-tags {
    position: absolute;
    z-index: 9999;
  }

  .tags-container {
    display: flex;
    margin: auto;
    width: 100%;
    align-items: center;
  }

  .tag {
    background-color: #0095ff;
    color: white;
    padding: 5px 10px 5px 10px;
    border-radius: 50px;
    margin: 5px;
    font-size: small;
    display: flex;
    align-items: center;
  }

  .tag > * {
  flex: 1;
}

  .remove-tag {
    border: none;
    cursor: pointer;
    font-size: small;
    color: white;
    background-color: transparent;
    margin-left: 5px;
  }

  .select-tags {
    position: relative;
    overflow: visible;
  }

</style>