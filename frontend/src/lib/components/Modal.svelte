<script>
    let showModal = false;
</script>

{#if showModal}
<div class="backdrop">
    <div class="modal">
        hello
    </div>
</div>
{/if}

<style>
    .backdrop {
        width: 100vh;
        height: 100vh;
        position: fixed;
        background: rgba(0, 0, 0, 0.5);
    }
    .modal {

    }
</style>