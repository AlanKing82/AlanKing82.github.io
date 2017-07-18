import React, { Component } from 'react';
import anime from 'animejs'

class Slider extends React.Component {
  constructor () {
    super();
    this.state = {
      activeIndex: 0,
      previousIndex: 0,
      previewIndex: 0,
      previewActive: false
    };
  }

  handleActive (index) {
    const { activeIndex } = this.state;
    this.setState({
      activeIndex: index,
      previousIndex: activeIndex,
      previewActive: false
    });
  }

  handlePreview (index, offset, activate) {
    this.setState({
      previewOffset: offset,
      previewIndex: index,
      previewActive: activate
    });
  }

  render () {
    const {
      activeIndex,
      previousIndex,
      previewIndex,
      previewOffset,
      previewActive
    } = this.state;

    const { slides, dotSettings, animSettings } = this.props;
    const { preview } = slides[previewIndex];
    const { content: current } = slides[activeIndex];
    const { content: previous } = slides[previousIndex];

    return (
      <div className='slides'>
        <Slide
          current={current}
          previous={previous}
          />
        <SlidePreview
          {...animSettings}
          contentAnimMultiplier={1.65}
          gap={5}
          active={previewActive}
          offset={previewOffset}>
          { preview }
        </SlidePreview>
        <Navigator
          {...dotSettings}
          {...animSettings}
          num={slides.length}
          activeScale={0.75}
          onPreviewChange={this.handlePreview.bind(this)}
          onActiveChange={this.handleActive.bind(this)}
          />
      </div>
    );
  }
}

export default Slider;

class Slide extends React.Component {
  componentWillReceiveProps () {
    const { current } = this.props;
    this.setState({ current });
  }

  componentDidUpdate () {
    if (this.state.current === this.props.current) return;

    const { anim, el } = this;
    if (anim) stopAnimation(anim);

    // using anime's [start, finish] syntax for scale
    // and opacity was causing a weird stutter so we're
    // just manually setting the initial state here.
    el.style.transform = 'scale(0.85)';
    el.style.opacity = 0;
    this.anim = anime({
      targets: el,
      scale: 1,
      opacity: 1,
      duration: 250,
      easing: 'easeOutQuint'
    });
  }

  render () {
    const { previous, current } = this.props;
    return (
      <div className='slide-wrap'>
        <div className='slide'>
          <div className='slide__inner'>
            {previous}
          </div>
          <div className='slide__inner slide__inner--active' ref={el => { this.el = el; }}>
            {current}
          </div>
        </div>
      </div>
    );
  }
}

class SlidePreview extends React.Component {
  componentDidUpdate () {
    const {
      offset,
      animElasticity,
      animDuration,
      contentAnimMultiplier
    } = this.props;

    const { xOff, yOff } = offset;
    const { animations, triangle, content } = this;

    if (animations) stopAnimation(animations);
    this.setTopPosition(yOff);

    const contentOff = content.offsetWidth;
    const triangleOff = triangle.offsetWidth;

    const contentAnim = anime({
      targets: content,
      duration: animDuration * contentAnimMultiplier,
      elasticity: animElasticity * contentAnimMultiplier,
      translateX: this.clamp(xOff - contentOff / 2, contentOff)
    });

    const triangleAnim = anime({
      targets: triangle,
      translateX: xOff - triangleOff / 2,
      elasticity: animElasticity,
      duration: animDuration
    });

    this.animations = [contentAnim, triangleAnim];
  }

  setTopPosition (yOff) {
    const { gap } = this.props;
    const { content, triangle } = this;
    const triangleOff = triangle.offsetHeight;
    const contentOff = content.offsetHeight;
    const offset = yOff - gap;
    content.style.top = `${offset - contentOff - triangleOff}px`;
    triangle.style.top = `${offset - triangleOff}px`;
  }

  clamp (amount, offset) {
    const min = 0;
    const max = window.innerWidth - offset;
    // http://stackoverflow.com/a/11409978
    return Math.max(min, Math.min(amount, max));
  }

  render () {
    const { children, active } = this.props;
    const baseClass = 'slide__slide-preview';
    const activeClass = 'slide__slide-preview--active';
    const classes = active ? `${baseClass} ${activeClass}` : baseClass;
    return (
      <div className={classes}>
        <div
          className='slide-preview__content'
          ref={el => { this.content = el; }}
          children={children}
          />
        <div
          className='slide-preview__triangle'
          ref={el => { this.triangle = el; }}
          />
      </div>
    );
  }
}

class Navigator extends React.Component {
  constructor () {
    super();
    this.state = {
      start: 0,
      snapped: 0,
      index: 0,
      listeners: this.buildListeners()
    };
  }

  buildListeners () {
    return ({
      mousemove: e => {
        e.preventDefault();
        this.drag(e);
      },
      touchmove: e => {
        e.preventDefault();
        e = e.touches[0];
        this.drag(e);
      },
      mouseup: () => {
        this.stopDrag();
      },
      touchend: () => {
        this.stopDrag();
      }
    });
  }

  componentDidMount () {
    const { size, gap, num } = this.props;
    const snaps = [];
    for (let i = 0; i < num; i++) {
      snaps.push(i * (size + gap));
    }
    this.setState({ snaps });
    this.handlePreviewIndex(snaps, snaps[0], false);
  }

  addDragListeners () {
    const { listeners } = this.state;
    for (const listener in listeners) {
      window.addEventListener(listener, listeners[listener]);
    }
  }

  removeDragListeners () {
    const { listeners } = this.state;
    for (const listener in listeners) {
      window.removeEventListener(listener, listeners[listener]);
    }
  }

  startDrag (e) {
    const { activeScale } = this.props;
    const { snapped, snaps } = this.state;
    this.handlePreviewIndex(snaps, snapped);
    this.setState({ start: e.pageX - snapped });
    this.animate(snapped, activeScale);
    this.addDragListeners();
  }

  drag (e) {
    const { activeScale } = this.props;
    const { start, snaps } = this.state;
    const actual = e.pageX - start;
    const snapped = this.snap(snaps, actual);

    if (snapped !== this.state.snapped) {
      this.animate(snapped, activeScale);
      this.handlePreviewIndex(snaps, snapped);
      this.setState({ snapped });
    }
  }

  stopDrag () {
    const { snapped, snaps } = this.state;
    this.handleActiveIndex(snaps, snapped);
    this.animate(snapped, 1);
    this.removeDragListeners();
  }

  handlePreviewIndex (snaps, snapped, activate = true) {
    const { onPreviewChange, size, gap } = this.props;
    const { navEl } = this;
    if (onPreviewChange) {
      const index = snaps.indexOf(snapped);
      const { top, left } = navEl.getBoundingClientRect();
      const dotOffset = (size /2) + gap;
      const offsets = {
        xOff: snapped + left + dotOffset,
        yOff: top + window.pageYOffset
      };
      onPreviewChange(index, offsets, activate);
    }
  }

  handleActiveIndex (snaps, snapped) {
    const index = snaps.indexOf(snapped);
    const { onActiveChange } = this.props;
    if (onActiveChange) {
      onActiveChange(index);
    }
  }

  animate (translateX, scale) {
    const { animElasticity, animDuration } = this.props;
    const { anim } = this;
    if (anim) stopAnimation(anim);
    this.anim = anime({
      targets: this.current.el,
      translateX,
      scale,
      elasticity: animElasticity,
      duration: animDuration
    });
  }

  snap (arr, num) {
    arr = [...arr]; // copy to avoid mutating params
    const diffOne = Math.abs(arr[0] - num);
    const diffTwo = Math.abs(arr[1] - num);
    return diffOne < diffTwo || arr.length === 1
      ? arr[0]
    : this.snap(arr.slice(1), num);
  }

  render () {
    let { num, size, gap } = this.props;
    const dots = [];

    dots.push(
      <NavDot
        className='slide-nav__current'
        ref={current => { this.current = current; }}
        size={size}
        />
    );

    for (let i = 0; i < num; i++) {
      const margin = (i !== num - 1) ? gap : 0;
      dots.push(
        <NavDot
          className='slide-nav__indicator'
          size={size}
          margin={margin}
          />
      );
    }

    return (
      <div className='slide-nav-wrap'>
        <div
          className='slide-nav'
          ref={el => { this.navEl = el; }}
          children={dots}
          onMouseDown={this.startDrag.bind(this)}
          onTouchStart={e => {
            e.preventDefault();
            this.startDrag(e.touches[0]);
          }} />
      </div>
    );
  }
}

class NavDot extends React.Component {
  render () {
    const { size, margin = 0 } = this.props;

    const styles = {
      height: `${size}px`,
      width: `${size}px`,
      marginRight: `${margin}px`
    };

    return (
      <div
        ref={el => { this.el = el; }}
        className={this.props.className}
        style={styles}
        />
    );
  }
}

const stopAnimation = animations => {
  /*
   This used to just pause any remaining animation
   but anime gets stuck sometimes when an animation
   is trying to tween values approaching 0.

   Basically to avoid that we're just forcing near-finished
   animations to jump to the end.

   This is definitely a hack but it gets the job done—
   if the root cause can be determined it would be good
   to revisit.
   */
  const stop = anim => {
    const { duration, remaining } = anim;
    if (remaining === 1) anim.seek(duration);
    else anim.pause();
  };
  if (Array.isArray(animations)) animations.forEach(anim => stop(anim));
  else stop(animations);
};