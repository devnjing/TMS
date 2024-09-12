<script>
	import { onMount } from "svelte";
  import Dropdown from "./Dropdown.svelte";
  import {getAllGroups} from '$api';

  export let selected = [];
  export let editTags = false;
  let options = [];

  onMount(async () => {
    options = await getAllGroups();
  })


  $: reactiveSelected = selected;

  

  function removeTag(tag) {
    selected = selected.filter(t => t !== tag);
  }

</script>

<div class="tags-container">

  {#if editTags}
    <div class="select-tags">
      <Dropdown {options} bind:selected={selected}/>
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
  }

  .tag:hover {
    background-color: #FF474C;
  }

  .remove-tag {
    border: none;
    cursor: pointer;
    font-size: small;
    background-color: transparent;
  }

  .select-tags {
    position: relative;
    overflow: visible;
  }

</style>