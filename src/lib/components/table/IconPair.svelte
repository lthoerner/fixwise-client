<script lang="ts">
	export let icon: 'filter' | 'column';
	export let text: string | number;

	const svgPath =
		icon === 'filter'
			? 'M3.9 54.9C10.5 40.9 24.5 32 40 32H472c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9V448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6V320.9L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z'
			: 'M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zm64 64V416H224V160H64zm384 0H288V416H448V160z';
</script>

<div>
	<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
		<path d={svgPath} />
	</svg>
	<span>{text}</span>
</div>

<style lang="scss">
	@use '$styles/variables';
	@use '$styles/utility';

	div {
		@include utility.flex-row;
		@include utility.medium-text;
		gap: utility.$width-small;

		svg {
			height: 1.1em;

			path {
				fill: variables.$primary-color;
			}
		}
	}
</style>
