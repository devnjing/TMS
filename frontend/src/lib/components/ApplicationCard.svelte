<script>
export let appDetails = [];
</script>

<div class="application-card">
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
p {
  margin-top: 10px;
}
</style>