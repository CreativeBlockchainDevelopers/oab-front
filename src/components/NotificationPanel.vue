<template>
  <notifications
    position="bottom right"
    classes="notifications"
  />
</template>

<style lang="scss">
@use "sass:map";

$colors: (
  "": #4df,
  ".error": #f54,
  ".warn": #fc3,
  ".success": #4f5,
);
$icons: (
  "": "⊙",
  ".error": "⊗",
  ".warn": "⊘",
  ".success": "⊚",
);
$bloom: 0.5rem;

.vue-notification-template.notifications {
  margin: .5rem;
  margin-top: 0;
  border: 1px solid;
  background: #111;
  color: #eee;
  padding: .4rem;
  padding-left: 1.7rem;
  border-radius: .5rem;
  position: relative;
  font-family: monospace;

  &::after {
    display: flex;
    align-items: center;
    position: absolute;
    top: .2rem;
    left: .2rem;
    bottom: .2rem;
    width: 1.7rem;
    border-radius: .3rem;
    color: #0009;
    font-size: 2rem;
    padding-bottom: .25rem;
    font-family: serif;
  }

  .notification-title {
    color: #eee;
    font-weight: bold;
    font-size: .7rem;
    padding: 0 0 .2rem .2rem;
    text-transform: uppercase;
    text-align: center;
  }

  .notification-content {
    padding: .5rem;
    color: #111;
    border-radius: 0 .3rem .3rem 0;
  }

  @each $type, $color in $colors {
    &#{$type} {
      border-color: $color;

      &::after {
        content: map.get($icons, $type);
        background: $color;
        box-shadow: 0 0 $bloom $color;
      }

      .notification-content {
        background: $color;
        box-shadow: 0 0 $bloom $color;
      }
    }
  }
}
</style>
