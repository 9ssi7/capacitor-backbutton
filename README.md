<p align="center"><br><img src="https://avatars.githubusercontent.com/u/76786120?v=4" width="128" height="128" style="border-radius: 50px;" /></p>
<h3 align="center">Ssibrahimbas Capacitor Back Button</h3>
<p align="center"><strong><code>@ssibrahimbas/capacitor-backbutton</code></strong></p>
<p align="center">
  It simplifies the use of the backbutton for the capacitor.
</p>

## Maintainers

| Maintainer            | GitHub                                          | Web                                                     |
|-----------------------|-------------------------------------------------|---------------------------------------------------------|
| Sami Salih İbrahimbaş | [ssibrahimbas](https://github.com/ssibrahimbas) | [@ssibrahimbas](https://www.samisalihibrahimbas.com.tr) |

## Motivation

Although Capacitor itself provides backButton support, this is not effective. Namely, you can have more than one popup
in a page. This popup should close when the user triggers the back button on android devices. Capacitor provides this.
But when this popup closes, its page should not come back either. All that needs to be done is to close the popup. Here,
the capacitor does not provide it, but we provide it with this package.

@ssibrahimbas/capacitor-backbutton package creates a priority-based queue in the background. Each listener function
subscribes to this queue. The function with the highest priority runs first, and can have the next listener run if it
wishes.

This pack is clearly inspired by Ionic's backbutton engine. But it is expensive to work with Ionic infrastructure just
for the backbutton. That's why I wrote this package and you can provide backbutton management in a very light and
performance way.

| Dependencies       | GitHub                                                     | Npm                                                                             |
|--------------------|------------------------------------------------------------|---------------------------------------------------------------------------------|
| @ssibrahimbas/core | [@ssibrahimbas/core](https://github.com/ssibrahimbas/core) | [@ssibrahimbas/core](https://www.npmjs.com/package/@ssibrahimbas/core)          |
| @capacitor/app     | [@capacitor/app](https://www.npmjs.com/package/@capacitor/app)     | [@capacitor/app](https://github.com/ionic-team/capacitor-plugins/tree/main/app) |

@ssibrahimbas/core package provides Queue, PriorityQueue and Stack infrastructure. You know that JavaScript and
TypeScript themselves do not have this structure.

## Installation

```bash

$ npm install @ssibrahimbas/capacitor-backbutton

```

### Or with yarn:

```bash

$ yarn add @ssibrahimbas/capacitor-backbutton

```

## API

<docgen-index>

### BackButtonHardware

* [`listen()`](#listen)
* [`subscribe(...)`](#subscribe)
* [`unsubscribe(...)`](#unsubscribe)

### Types

* [`IBackButtonHardware`](#IBackButtonHardware)
* [`BackButtonListener`](#BackButtonListener)
* [`CallbackFunction`](#CallbackFunction)
* [`NextFunction`](#NextFunction)

### Examples
* [`Usage`](#Usage)


</docgen-index>

<br/>

## BackButtonHardware

### listen()

It starts listening for the backbutton event. It does not affect the subscription. You can subscribe or unsubscribe before or after listening.

**Returns:** <code>void</code>

<br/>

### subscribe(...)

Subscribe to the backbutton event

| Param         | Type                      |
|---------------|---------------------------|
| **`eventListener`** | **` BackButtonListener`** |

**Returns:** <code>void</code>

<br/>

### unsubscribe(...)

Unsubscribe to the backbutton event

| Param         | Type                      |
|---------------|---------------------------|
| **`eventListener`** | **` BackButtonListener`** |

**Returns:** <code>void</code>

<br/>

## Types

### IBackButtonHardware

| Field         | Type                            |
|---------------|---------------------------------|
| **`name`** | string                          |
| **`$app`** | **` AppPlugin`**                |
| **`listen`** | **`() => void`**                |
| **`subscribe`** | **`(eventListener: BackButtonListener) => void`** |
| **`unsubscribe`** | **`(eventListener: BackButtonListener) => void`**    |

<br/>

### BackButtonListener

each listener must subscribe to the event according to this type.

The unique value is required to unsubscribe.
Priority value is required to detect priority.
The callback value is required to run the function.

| Field         | Type                   |
|---------------|------------------------|
| **`unique`** | string                 |
| **`priority`** |  number             |
| **`callback`** | **`CallbackFunction`**       |

<br/>

### CallbackFunction

listener function

| Param         | Type                      |
|---------------|---------------------------|
| **`event`** | **` BackButtonListenerEvent`** |
| **`next`** | **` NextFunction`** |

**Returns:** <code>void</code>

<br/>

### NextFunction

type of function that runs the next listener

**Returns:** <code>void</code>

<br/>

<docgen-api>

## Usage

### For TypeScript

```typescript

import {App as app, BackButtonListenerEvent} from "@capacitor/app";
import {BackButtonHardware, IBackButtonHardware, NextFunction} from "@ssibrahimbas/capacitor-backbutton";

const backButtonHardware: IBackButtonHardware = new BackButtonHardware(app);

function exitApp(): void {
    app.exitApp();
}

function prevPage() : void {
    // router.back();
}

function closePopup() : void {
    // close popup
}

backButtonHardware.subscribe({
    unique: "closePopup",
    priority: 100,
    callback: (event: BackButtonListenerEvent, next: NextFunction) => {
        closePopup();
        // call next if you want next listener to run after popup closes
    }
})

backButtonHardware.subscribe({
    unique: "exitApp",
    priority: -1,
    callback: (event: BackButtonListenerEvent, next: NextFunction) => {
        if(event.canGoBack) return next();
        extiApp();
    }
})

backButtonHardware.subscribe({
    unique: "prevPage",
    priority: 1,
    callback: (event: BackButtonListenerEvent, next: NextFunction) => {
        prevPage();
        next();
    }
})
```

### For Vue

```javascript

// main.js
import {App as app} from "@capacitor/app";
import {BackButtonHardware} from "@ssibrahimbas/capacitor-backbutton";
import {createApp} from "vue";

const BackButton = {
	install: (app) => {
		app.config.globalProperties.$backButton = new BackButtonHardware(app);
    }
}

const app = createApp();
app.use(BackButton);
app.mount("#app");

```

```vue

// app.vue

<template>
  // bla bla
</template>

<script>
export default {
  data() {
    return {
      popup: {
        show: true
      }
    }
  },
  methods: {
    closePopup(event, next) {
      // if the popup is not shown, the next listener is called. For this example, the prevPage listener works.
      if(this.popup.show) {
        this.popup.show = false;
        return;
      }
      next();
    },
    prevPage(event, next) {
      this.$router.back();
    }
  },
  mounted() {
    this.$backButton.listen();
    this.$backButton.subscribe({
      unique: "appClosePopup",
      priority: 100,
      callback: this.closePopup
    });
    this.$backButton.subscribe({
      unique: "appPrevPage",
      priority: 1,
      callback: this.prevPage
    });
  }
}
</script>

// Use Composition API

<script>
import {ref, onMounted, getCurrentInstance} from "vue"

export default {
  setup(){
    const popupShow = ref(false);
    
    const closePopup = (event, next) => {
      if(this.popupShow.value) {
        this.popupShow.value = false;
        return;
      }
      next();
    }
    
    const prevPage = (event, next) => {
      // router back
    }
    
    onMounted(() => {
      const backButton = getCurrentInstance().appContext.config.globalProperties.$backButton;
      backButton.listen();
      backButton.subscribe({
        unique: "appClosePopup",
        priority: 100,
        callback: closePopup
      });
      backButton.subscribe({
        unique: "appPrevPage",
        priority: 1,
        callback: prevPage
      });
    })
    
    return {
      closePopup,
      prevPage,
      popupShow
    }
  }
}
</script>


// Use Vue 3 Hooks and TypeScript

<script setup lang="ts">
import { useBackButton, type CallbackFunction, type BackButtonListener } from "@ssibrahimbas/capacitor-backbutton";
import { ref, onMounted, onUnMounted } from "vue"
import { useRouter } from "vue-router"

const popupShow = ref<boolean>(false);
const { subscribe, unsubscribe, listen } = useBackButton();
const router = useRouter();

const closePopup : CallbackFunction = (event, next) : void => {
  if(this.popupShow.value) {
    this.popupShow.value = false;
    return;
  }
  next();
}

const prevPage : CallbackFunction = (event, next) : void => {
  router.back();
}

const getSubscribers = () : BackButtonListener[] => {
  return [
    {
    unique: "appClosePopup",
    priority: 100,
    callback: closePopup
  }, 
  {
    unique: "appPrevPage",
    priority: 1,
    callback: prevPage
  }
  ]
}

onMounted(() : void => {
  listen();
  subscribe(...getSubscribers());
})

onUnMounted(() : void => {
  unsubscribe(...getSubscribers())
})
</script>

```



</docgen-api>