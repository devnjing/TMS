<script>
import {goto} from "$app/navigation";
import {onMount} from "svelte";

export let appDetails = [];

const handleEnterApp = () => {
  goto(`/applications/${appDetails.App_Acronym}`);
}

onMount(() => {
  appDetails.startDate = new Date(appDetails.App_startDate);
  appDetails.endDate = new Date(appDetails.App_endDate);
})

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="application-card" on:click={handleEnterApp}>
  <h1>{appDetails.App_Acronym}</h1>
  <p><b>App Description</b> {appDetails.App_Description}</p>
  <p><b>Start Date</b> {appDetails.App_startDate}</p>
  <p><b>End Date</b> {appDetails.App_endDate}</p>
</div>

<style>
.application-card {
  width: 650px;
  height: 200px;
  padding: 20px;
  margin: 10px;
  background-color: #eee;
}
.application-card:hover {
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.1);
}
p {
  margin-top: 10px;
}
</style>