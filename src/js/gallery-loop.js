import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

// Canonical GSAP "horizontalLoop" helper (documented recipe from the GSAP
// forums/docs) — seamlessly loops an array of elements horizontally without
// needing manual clone elements; wrapping math is handled internally.
export function horizontalLoop(items, config) {
  items = gsap.utils.toArray(items);
  config = config || {};
  let tl;
  gsap.context(() => {
    let onChange = config.onChange,
      lastIndex = 0,
      timeline = gsap.timeline({
        repeat: config.repeat,
        onUpdate:
          onChange &&
          function () {
            const i = timeline.closestIndex();
            if (lastIndex !== i) {
              lastIndex = i;
              onChange(items[i], i);
            }
          },
        paused: config.paused,
        defaults: { ease: 'none' },
        onReverseComplete: () => timeline.totalTime(timeline.rawTime() + timeline.duration() * 100),
      }),
      length = items.length,
      startX = items[0].offsetLeft,
      times = [],
      widths = [],
      spaceBefore = [],
      xPercents = [],
      curIndex = 0,
      center = config.center,
      pixelsPerSecond = (config.speed || 1) * 100,
      snap = config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1),
      timeOffset = 0,
      container = center === true ? items[0].parentNode : gsap.utils.toArray(center)[0] || items[0].parentNode,
      totalWidth,
      getTotalWidth = () =>
        items[length - 1].offsetLeft +
        (xPercents[length - 1] / 100) * widths[length - 1] -
        startX +
        spaceBefore[0] +
        items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], 'scaleX') +
        (parseFloat(config.paddingRight) || 0),
      populateWidths = () => {
        let b1 = container.getBoundingClientRect(),
          b2;
        items.forEach((el, i) => {
          widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px'));
          xPercents[i] = snap(
            (parseFloat(gsap.getProperty(el, 'x', 'px')) / widths[i]) * 100 + gsap.getProperty(el, 'xPercent')
          );
          b2 = el.getBoundingClientRect();
          spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
          b1 = b2;
        });
        gsap.set(items, { xPercent: (i) => xPercents[i] });
        totalWidth = getTotalWidth();
      },
      timeWrap,
      populateOffsets = () => {
        timeOffset = center ? (timeline.duration() * (container.offsetWidth / 2)) / totalWidth : 0;
        center &&
          times.forEach((t, i) => {
            times[i] = timeWrap(
              timeline.labels['label' + i] + (timeline.duration() * widths[i]) / 2 / totalWidth - timeOffset
            );
          });
      },
      getClosest = (values, value, wrap) => {
        let i = values.length,
          closest = 1e10,
          index = 0,
          d;
        while (i--) {
          d = Math.abs(values[i] - value);
          if (d > wrap / 2) d = wrap - d;
          if (d < closest) {
            closest = d;
            index = i;
          }
        }
        return index;
      },
      populateTimeline = () => {
        let i, item, curX, distanceToStart, distanceToLoop;
        timeline.clear();
        for (i = 0; i < length; i++) {
          item = items[i];
          curX = (xPercents[i] / 100) * widths[i];
          distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
          distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, 'scaleX');
          timeline
            .to(
              item,
              { xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100), duration: distanceToLoop / pixelsPerSecond },
              0
            )
            .fromTo(
              item,
              { xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100) },
              {
                xPercent: xPercents[i],
                duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                immediateRender: false,
              },
              distanceToLoop / pixelsPerSecond
            )
            .add('label' + i, distanceToStart / pixelsPerSecond);
          times[i] = distanceToStart / pixelsPerSecond;
        }
        timeWrap = gsap.utils.wrap(0, timeline.duration());
      },
      refresh = (deep) => {
        const progress = timeline.progress();
        timeline.progress(0, true);
        populateWidths();
        deep && populateTimeline();
        populateOffsets();
        deep && timeline.draggable ? timeline.time(times[curIndex], true) : timeline.progress(progress, true);
      },
      onResize = () => refresh(true),
      proxy;

    gsap.set(items, { x: 0 });
    populateWidths();
    populateTimeline();
    populateOffsets();
    window.addEventListener('resize', onResize);

    function toIndex(index, vars) {
      vars = vars || {};
      Math.abs(index - curIndex) > length / 2 && (index += index > curIndex ? -length : length);
      const newIndex = gsap.utils.wrap(0, length, index);
      let time = times[newIndex];
      if (time > timeline.time() !== index > curIndex && index !== curIndex) {
        time += timeline.duration() * (index > curIndex ? 1 : -1);
      }
      if (time < 0 || time > timeline.duration()) vars.modifiers = { time: timeWrap };
      curIndex = newIndex;
      vars.overwrite = true;
      gsap.killTweensOf(proxy);
      return vars.duration === 0 ? timeline.time(timeWrap(time)) : timeline.tweenTo(time, vars);
    }

    timeline.toIndex = (index, vars) => toIndex(index, vars);
    timeline.closestIndex = (setCurrent) => {
      const index = getClosest(times, timeline.time(), timeline.duration());
      if (setCurrent) curIndex = index;
      return index;
    };
    timeline.current = () => curIndex;
    timeline.next = (vars) => toIndex(timeline.current() + 1, vars);
    timeline.previous = (vars) => toIndex(timeline.current() - 1, vars);
    timeline.times = times;
    timeline.progress(1, true).progress(0, true);

    if (config.reversed) {
      timeline.vars.onReverseComplete();
      timeline.reverse();
    }

    if (config.draggable) {
      proxy = document.createElement('div');
      const wrap = gsap.utils.wrap(0, 1);
      let ratio, startProgress, dragSnap, lastSnap, initChangeX, wasPlaying;

      const draggable = Draggable.create(proxy, {
        trigger: items[0].parentNode,
        type: 'x',
        onPressInit() {
          const x = this.x;
          gsap.killTweensOf(timeline);
          wasPlaying = !timeline.paused();
          timeline.pause();
          startProgress = timeline.progress();
          refresh(false);
          ratio = 1 / totalWidth;
          initChangeX = startProgress / -ratio - x;
          gsap.set(proxy, { x: startProgress / -ratio });
        },
        onDrag() {
          timeline.progress(wrap(startProgress + (this.startX - this.x) * ratio));
        },
        onThrowUpdate() {
          timeline.progress(wrap(startProgress + (this.startX - this.x) * ratio));
        },
        overshootTolerance: 0,
        inertia: true,
        snap(value) {
          if (Math.abs(startProgress / -ratio - this.x) < 10) return lastSnap + initChangeX;
          const time = -(value * ratio) * timeline.duration();
          const wrappedTime = timeWrap(time);
          const snapTime = times[getClosest(times, wrappedTime, timeline.duration())];
          let dif = snapTime - wrappedTime;
          Math.abs(dif) > timeline.duration() / 2 && (dif += dif < 0 ? timeline.duration() : -timeline.duration());
          lastSnap = (time + dif) / timeline.duration() / -ratio;
          return lastSnap;
        },
        onRelease() {
          gsap.set(proxy, { x: 0 });
          wasPlaying && timeline.play();
        },
        onThrowComplete: () => {
          // Sync bookkeeping to the tile the swipe actually landed on, and
          // only resume autoplay if this loop was auto-playing before the
          // drag — otherwise a swipe on a paused (peek) carousel would keep
          // drifting forward on its own after release.
          timeline.closestIndex(true);
          wasPlaying && timeline.play();
        },
      })[0];
      timeline.draggable = draggable;
    }

    timeline.closestIndex(true);
    lastIndex = curIndex;
    onChange && onChange(items[curIndex], curIndex);
    tl = timeline;
  });
  return tl;
}
