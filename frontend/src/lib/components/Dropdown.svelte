<script>
  import { createEventDispatcher } from 'svelte';

  export let options = [];
  export let selected = [];
  export let dropdownText = "+";

  const dispatch = createEventDispatcher();
  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
  }

  function select(option) {
    if (selected.includes(option)) {
      selected = selected.filter(s => s !== option);
    } else {
      selected = [...selected, option];
    }
  }

	function clickOutside(element, callbackFunction) {
		function onClick(event) {
			if (!element.contains(event.target)) {
				callbackFunction();
			}
		}
		
		document.body.addEventListener('click', onClick);
		
		return {
			update(newCallbackFunction) {
				callbackFunction = newCallbackFunction;
			},
			destroy() {
				document.body.removeEventListener('click', onClick);
			}
		}
	}

  function handleOpen() {
      toggle();
      dispatch('open');
    }
</script>

<div class="dropdown" use:clickOutside={() => (isOpen = false)}>
  <button class="dropdown-toggle" on:click={handleOpen}>
    {dropdownText}
  </button>
  {#if isOpen}
    <ul class="dropdown-menu">
      {#each options as option}
        <li class={selected.includes(option) ? 'selected' : ''} on:click={() => select(option)}>
          {option}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>

  .dropdown {
    position: relative;
  }

  .dropdown-toggle {
    background-color: #eee;
    border: none;
    padding: 5px 10px 5px 10px;
    border-radius: 50px;
    margin: 5px;
    font-size: small;
    cursor: pointer;
  }

  .dropdown-menu {
    width: 200px;
    position: absolute;
    top: 100%;
    left: 0;
    margin-left: 35px;
    background-color: #fff;
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 5px;
    display: block;
  }

  .dropdown-menu li {
    list-style: none;
    padding: 10px;
    cursor: pointer;
  }

  .dropdown-menu li.selected {
    background-color: #0095ff;
    color: white;
  }

  .dropdown-menu li:hover {
    background-color: rgba(0, 0, 0,0, 0.8);
  }
</style>