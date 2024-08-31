<script>
	import '$styles/global.scss';
</script>

<nav>
	<a href="/tickets">Tickets</a>
	<a href="/customers">Customers</a>
	<a href="/devices">Devices</a>
	<a href="/parts">Parts</a>
	<a href="/vendors">Vendors</a>
	<a href="/device_models">Device Models</a>
</nav>

<div id="page-body">
	<slot />
</div>

<style lang="scss">
	@use '$styles/variables';
	@use '$styles/utility';

	nav {
		@include utility.flex-row;
		font-size: variables.$font-size-title;
		font-weight: bold;

		background-color: purple;

		a {
			padding-top: 18px;
			padding-bottom: 13px;
			padding-left: 25px;
			padding-right: 25px;
			text-decoration: none;
			transition: variables.$transition-standard;

			&:hover {
				cursor: pointer;
				background-color: magenta;
			}
		}
	}

	#page-body {
		padding: 25px;
	}
</style>
