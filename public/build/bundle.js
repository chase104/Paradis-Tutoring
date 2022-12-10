
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src\components\NextButton.svelte generated by Svelte v3.50.1 */

    const { console: console_1$1 } = globals;
    const file$8 = "src\\components\\NextButton.svelte";

    function create_fragment$8(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "▼";
    			attr_dev(button, "class", "flashing-button svelte-rlxyi7");
    			attr_dev(button, "aria-label", "Learn more about my tutoring services");
    			toggle_class(button, "dark", /*theme*/ ctx[0] === "dark");
    			add_location(button, file$8, 17, 0, 474);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*scrollToServices*/ ctx[1], false, false, false),
    					listen_dev(button, "keypress", /*handleKeyPress*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*theme*/ 1) {
    				toggle_class(button, "dark", /*theme*/ ctx[0] === "dark");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NextButton', slots, []);
    	let { target } = $$props;
    	let { theme } = $$props;
    	console.log(target);

    	const scrollToServices = () => {
    		console.log(target);
    		const aboutSection = document.querySelector(target);
    		aboutSection.scrollIntoView({ behavior: 'smooth' });
    	};

    	const handleKeyPress = event => {
    		if (event.key === 'Enter' || event.key === 'Space') {
    			scrollToServices();
    			event.preventDefault();
    		}
    	};

    	const writable_props = ['target', 'theme'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<NextButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('target' in $$props) $$invalidate(3, target = $$props.target);
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	$$self.$capture_state = () => ({
    		target,
    		theme,
    		scrollToServices,
    		handleKeyPress
    	});

    	$$self.$inject_state = $$props => {
    		if ('target' in $$props) $$invalidate(3, target = $$props.target);
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, scrollToServices, handleKeyPress, target];
    }

    class NextButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { target: 3, theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NextButton",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*target*/ ctx[3] === undefined && !('target' in props)) {
    			console_1$1.warn("<NextButton> was created without expected prop 'target'");
    		}

    		if (/*theme*/ ctx[0] === undefined && !('theme' in props)) {
    			console_1$1.warn("<NextButton> was created without expected prop 'theme'");
    		}
    	}

    	get target() {
    		throw new Error("<NextButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set target(value) {
    		throw new Error("<NextButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get theme() {
    		throw new Error("<NextButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<NextButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\About.svelte generated by Svelte v3.50.1 */
    const file$7 = "src\\components\\About.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let h1;
    	let t2;
    	let p;
    	let t4;
    	let nextbutton;
    	let current;
    	let mounted;
    	let dispose;

    	nextbutton = new NextButton({
    			props: { target: "#contact", theme: "dark" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "About Me";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Hello! I'm Matt Paradis, an experienced educator with a rich background in teaching English across various levels and a passion for helping students achieve their academic goals. Originally from the USA, I've embraced the adventure of living abroad, bringing a global perspective to my teaching methods.";
    			t4 = space();
    			create_component(nextbutton.$$.fragment);
    			if (!src_url_equal(img.src, img_src_value = "../assets/paradis_profile.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Your Name");
    			attr_dev(img, "class", "profile-image svelte-tbo0g2");
    			attr_dev(img, "applied", "");
    			attr_dev(img, "cubicout", "");
    			attr_dev(img, "easing", "");
    			toggle_class(img, "visible", /*isVisible*/ ctx[0]);
    			add_location(img, file$7, 111, 4, 2444);
    			attr_dev(h1, "class", "section-title black-text svelte-tbo0g2");
    			add_location(h1, file$7, 118, 4, 2698);
    			attr_dev(p, "class", "svelte-tbo0g2");
    			add_location(p, file$7, 119, 4, 2754);
    			attr_dev(div, "class", "about-me svelte-tbo0g2");
    			attr_dev(div, "id", "#about");
    			add_location(div, file$7, 110, 2, 2404);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, h1);
    			append_dev(div, t2);
    			append_dev(div, p);
    			append_dev(div, t4);
    			mount_component(nextbutton, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(fly.call(null, img, {
    					y: 200,
    					duration: 800,
    					delay: 0,
    					opacity: 0,
    					easing: cubicOut
    				}));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*isVisible*/ 1) {
    				toggle_class(img, "visible", /*isVisible*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nextbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nextbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(nextbutton);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	let isVisible = false;

    	onMount(() => {
    		const observer = new IntersectionObserver(([entry]) => {
    				if (entry.isIntersecting && !isVisible) {
    					$$invalidate(0, isVisible = true);
    				}
    			},
    		{
    				threshold: 0.5, // Trigger when 50% of the element is in view
    				
    			});

    		observer.observe(document.querySelector('.about-me'));

    		return () => {
    			observer.disconnect();
    		};
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		cubicOut,
    		slide,
    		fly,
    		NextButton,
    		isVisible
    	});

    	$$self.$inject_state = $$props => {
    		if ('isVisible' in $$props) $$invalidate(0, isVisible = $$props.isVisible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isVisible];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const clickedTopic = writable("");

    /* src\components\Contact.svelte generated by Svelte v3.50.1 */
    const file$6 = "src\\components\\Contact.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (67:10) {#each service.types as type}
    function create_each_block_1$2(ctx) {
    	let option;
    	let t_value = /*type*/ ctx[16] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*type*/ ctx[16];
    			option.value = option.__value;
    			add_location(option, file$6, 67, 12, 2085);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(67:10) {#each service.types as type}",
    		ctx
    	});

    	return block;
    }

    // (65:8) {#each services as service}
    function create_each_block$3(ctx) {
    	let optgroup;
    	let each_value_1 = /*service*/ ctx[13].types;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			optgroup = element("optgroup");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(optgroup, "label", /*service*/ ctx[13].type);
    			add_location(optgroup, file$6, 65, 8, 1999);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, optgroup, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(optgroup, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*services*/ 32) {
    				each_value_1 = /*service*/ ctx[13].types;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(optgroup, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(optgroup);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(65:8) {#each services as service}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let section;
    	let h2;
    	let t1;
    	let form;
    	let p;
    	let t3;
    	let div0;
    	let label0;
    	let t5;
    	let input0;
    	let t6;
    	let div1;
    	let label1;
    	let t8;
    	let input1;
    	let t9;
    	let div2;
    	let label2;
    	let t11;
    	let select;
    	let option;
    	let t13;
    	let div3;
    	let label3;
    	let t15;
    	let textarea;
    	let t16;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*services*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h2 = element("h2");
    			h2.textContent = "Book a Consultation";
    			t1 = space();
    			form = element("form");
    			p = element("p");
    			p.textContent = "Thank you for your interest! I will contact you shortly!";
    			t3 = space();
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Email";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Class Type";
    			t11 = space();
    			select = element("select");
    			option = element("option");
    			option.textContent = "Select a class type";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Message";
    			t15 = space();
    			textarea = element("textarea");
    			t16 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			attr_dev(h2, "class", "section-title contact-title svelte-1gf58be");
    			add_location(h2, file$6, 44, 4, 1101);
    			attr_dev(p, "class", "success-msg");
    			toggle_class(p, "display-success", /*formSubmitted*/ ctx[1]);
    			add_location(p, file$6, 48, 8, 1315);
    			attr_dev(label0, "for", "name");
    			add_location(label0, file$6, 51, 10, 1495);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "class", "svelte-1gf58be");
    			add_location(input0, file$6, 52, 8, 1536);
    			attr_dev(div0, "class", "label-input-container svelte-1gf58be");
    			add_location(div0, file$6, 49, 8, 1446);
    			attr_dev(label1, "for", "email");
    			add_location(label1, file$6, 55, 6, 1656);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "class", "svelte-1gf58be");
    			add_location(input1, file$6, 56, 6, 1696);
    			attr_dev(div1, "class", "label-input-container svelte-1gf58be");
    			add_location(div1, file$6, 54, 8, 1613);
    			attr_dev(label2, "for", "topic");
    			add_location(label2, file$6, 60, 6, 1810);
    			option.__value = "";
    			option.value = option.__value;
    			add_location(option, file$6, 63, 8, 1907);
    			attr_dev(select, "name", "topic");
    			attr_dev(select, "class", "svelte-1gf58be");
    			if (/*topic*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[10].call(select));
    			add_location(select, file$6, 62, 6, 1857);
    			attr_dev(div2, "class", "label-input-container svelte-1gf58be");
    			add_location(div2, file$6, 58, 2, 1765);
    			attr_dev(label3, "for", "message");
    			add_location(label3, file$6, 76, 6, 2271);
    			attr_dev(textarea, "class", "message svelte-1gf58be");
    			attr_dev(textarea, "name", "message");
    			attr_dev(textarea, "placeholder", "Tell me a bit about what you're looking for");
    			attr_dev(textarea, "rows", "5");
    			add_location(textarea, file$6, 78, 6, 2317);
    			attr_dev(div3, "class", "label-input-container svelte-1gf58be");
    			add_location(div3, file$6, 74, 6, 2226);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-1gf58be");
    			add_location(button, file$6, 80, 6, 2481);
    			attr_dev(form, "action", "https://formspree.io/f/xqkrwajl");
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "class", "svelte-1gf58be");
    			toggle_class(form, "padding-top-success", /*formSubmitted*/ ctx[1]);
    			add_location(form, file$6, 47, 4, 1175);
    			attr_dev(section, "id", "contact");
    			attr_dev(section, "class", "page-padding svelte-1gf58be");
    			add_location(section, file$6, 43, 2, 1052);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h2);
    			append_dev(section, t1);
    			append_dev(section, form);
    			append_dev(form, p);
    			append_dev(form, t3);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t5);
    			append_dev(div0, input0);
    			set_input_value(input0, /*name*/ ctx[2]);
    			append_dev(form, t6);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t8);
    			append_dev(div1, input1);
    			set_input_value(input1, /*email*/ ctx[3]);
    			append_dev(form, t9);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t11);
    			append_dev(div2, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*topic*/ ctx[0]);
    			append_dev(form, t13);
    			append_dev(form, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t15);
    			append_dev(div3, textarea);
    			set_input_value(textarea, /*message*/ ctx[4]);
    			append_dev(form, t16);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[10]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[11]),
    					listen_dev(form, "submit", /*handleSubmit*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*formSubmitted*/ 2) {
    				toggle_class(p, "display-success", /*formSubmitted*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 4 && input0.value !== /*name*/ ctx[2]) {
    				set_input_value(input0, /*name*/ ctx[2]);
    			}

    			if (dirty & /*email*/ 8 && input1.value !== /*email*/ ctx[3]) {
    				set_input_value(input1, /*email*/ ctx[3]);
    			}

    			if (dirty & /*services*/ 32) {
    				each_value = /*services*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*topic, services*/ 33) {
    				select_option(select, /*topic*/ ctx[0]);
    			}

    			if (dirty & /*message*/ 16) {
    				set_input_value(textarea, /*message*/ ctx[4]);
    			}

    			if (dirty & /*formSubmitted*/ 2) {
    				toggle_class(form, "padding-top-success", /*formSubmitted*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $clickedTopic;
    	validate_store(clickedTopic, 'clickedTopic');
    	component_subscribe($$self, clickedTopic, $$value => $$invalidate(7, $clickedTopic = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	const services = getContext('services');
    	let topics = [];

    	services.forEach(service => {
    		topics = topics.concat(service.types);
    	});

    	let name = '';
    	let email = '';
    	let topic = '';
    	let message = '';

    	// we need to use localStorage here because formspree redirects us
    	let formSubmitted = localStorage.getItem("formSubmitted") === 'true';

    	clickedTopic.subscribe(value => {
    		if (value) {
    			$$invalidate(0, topic = value);
    		}
    	});

    	function handleSubmit() {
    		if (name && email && topic && message) {
    			$$invalidate(1, formSubmitted = true);
    		} else {
    			alert('Please fill in all the required fields.');
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(2, name);
    	}

    	function input1_input_handler() {
    		email = this.value;
    		$$invalidate(3, email);
    	}

    	function select_change_handler() {
    		topic = select_value(this);
    		($$invalidate(0, topic), $$invalidate(7, $clickedTopic));
    		$$invalidate(5, services);
    	}

    	function textarea_input_handler() {
    		message = this.value;
    		$$invalidate(4, message);
    	}

    	$$self.$capture_state = () => ({
    		getContext,
    		clickedTopic,
    		services,
    		topics,
    		name,
    		email,
    		topic,
    		message,
    		formSubmitted,
    		handleSubmit,
    		$clickedTopic
    	});

    	$$self.$inject_state = $$props => {
    		if ('topics' in $$props) topics = $$props.topics;
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('email' in $$props) $$invalidate(3, email = $$props.email);
    		if ('topic' in $$props) $$invalidate(0, topic = $$props.topic);
    		if ('message' in $$props) $$invalidate(4, message = $$props.message);
    		if ('formSubmitted' in $$props) $$invalidate(1, formSubmitted = $$props.formSubmitted);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$clickedTopic, topic*/ 129) {
    			$$invalidate(0, topic = $clickedTopic || topic);
    		}

    		if ($$self.$$.dirty & /*formSubmitted*/ 2) {
    			if (formSubmitted) {
    				localStorage.setItem("formSubmitted", 'true');

    				setTimeout(
    					() => {
    						$$invalidate(1, formSubmitted = false);
    						localStorage.removeItem("formSubmitted");
    					},
    					10000
    				);
    			}
    		}
    	};

    	return [
    		topic,
    		formSubmitted,
    		name,
    		email,
    		message,
    		services,
    		handleSubmit,
    		$clickedTopic,
    		input0_input_handler,
    		input1_input_handler,
    		select_change_handler,
    		textarea_input_handler
    	];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.50.1 */

    const file$5 = "src\\components\\Footer.svelte";

    function create_fragment$5(ctx) {
    	let footer;
    	let p;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			p = element("p");
    			p.textContent = "\"An investment in knowledge pays the best interest.\" – Benjamin Franklin";
    			attr_dev(p, "class", "svelte-22ueak");
    			add_location(p, file$5, 6, 4, 97);
    			attr_dev(footer, "class", "page-padding svelte-22ueak");
    			add_location(footer, file$5, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\Header.svelte generated by Svelte v3.50.1 */
    const file$4 = "src\\components\\Header.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let h1;
    	let t1;
    	let div;
    	let h3;
    	let t3;
    	let p;
    	let t5;
    	let nextbutton;
    	let current;

    	nextbutton = new NextButton({
    			props: { target: "#services" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "Paradis Tutoring";
    			t1 = space();
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Let your potential unfold";
    			t3 = space();
    			p = element("p");
    			p.textContent = "At Paradis Tutoring, we're committed to helping you excel in all aspects of English and communication. Led by Mr. Paradis, a seasoned educator with over 10 years of experience across multiple continents, our tutoring services are designed to boost your abilities and confidence in professional writing, SAT preparation, literary analysis, and public speaking.";
    			t5 = space();
    			create_component(nextbutton.$$.fragment);
    			attr_dev(h1, "class", "site-title flex-column-center svelte-1j6yyzf");
    			add_location(h1, file$4, 8, 4, 144);
    			attr_dev(h3, "class", "site-subtitle svelte-1j6yyzf");
    			add_location(h3, file$4, 13, 8, 284);
    			add_location(p, file$4, 16, 8, 374);
    			attr_dev(div, "class", "flex-column-center sub-header svelte-1j6yyzf");
    			add_location(div, file$4, 12, 4, 231);
    			attr_dev(section, "class", "background page-padding header-container svelte-1j6yyzf");
    			add_location(section, file$4, 7, 0, 80);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			append_dev(section, t1);
    			append_dev(section, div);
    			append_dev(div, h3);
    			append_dev(div, t3);
    			append_dev(div, p);
    			append_dev(section, t5);
    			mount_component(nextbutton, section, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nextbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nextbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(nextbutton);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ NextButton });
    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\ReviewForm.svelte generated by Svelte v3.50.1 */

    const file$3 = "src\\components\\ReviewForm.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (42:6) {#each Array(5) as _, i (i)}
    function create_each_block$2(key_1, ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*i*/ ctx[12]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			button = element("button");
    			t = text("★");
    			attr_dev(button, "class", "star-button svelte-1caadwo");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "aria-label", `Rate ${/*i*/ ctx[12] + 1} stars`);
    			toggle_class(button, "highlight", /*i*/ ctx[12] < /*stars*/ ctx[1]);
    			add_location(button, file$3, 42, 8, 1203);
    			this.first = button;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*Array, stars*/ 2) {
    				toggle_class(button, "highlight", /*i*/ ctx[12] < /*stars*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(42:6) {#each Array(5) as _, i (i)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let h2;
    	let t1;
    	let form;
    	let p0;
    	let t2;
    	let t3;
    	let label0;
    	let t5;
    	let input0;
    	let t6;
    	let label1;
    	let t8;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t9;
    	let input1;
    	let t10;
    	let label2;
    	let t12;
    	let textarea;
    	let t13;
    	let button;
    	let t15;
    	let p1;
    	let t16;
    	let mounted;
    	let dispose;
    	let each_value = Array(5);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*i*/ ctx[12];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h2 = element("h2");
    			h2.textContent = "Write a Review";
    			t1 = space();
    			form = element("form");
    			p0 = element("p");
    			t2 = text(/*formStatus*/ ctx[3]);
    			t3 = space();
    			label0 = element("label");
    			label0.textContent = "Title:";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			label1 = element("label");
    			label1.textContent = "Stars:";
    			t8 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			label2 = element("label");
    			label2.textContent = "Description:";
    			t12 = space();
    			textarea = element("textarea");
    			t13 = space();
    			button = element("button");
    			button.textContent = "Submit Review";
    			t15 = space();
    			p1 = element("p");
    			t16 = text(/*formStatus*/ ctx[3]);
    			add_location(h2, file$3, 32, 2, 713);
    			attr_dev(p0, "class", "success-msg");
    			toggle_class(p0, "display-success", /*formStatus*/ ctx[3].length > 0);
    			add_location(p0, file$3, 35, 4, 900);
    			attr_dev(label0, "for", "title");
    			attr_dev(label0, "class", "svelte-1caadwo");
    			add_location(label0, file$3, 36, 4, 991);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "title");
    			attr_dev(input0, "name", "title");
    			input0.required = true;
    			attr_dev(input0, "class", "svelte-1caadwo");
    			add_location(input0, file$3, 37, 4, 1030);
    			attr_dev(label1, "for", "stars");
    			attr_dev(label1, "class", "svelte-1caadwo");
    			add_location(label1, file$3, 39, 4, 1113);
    			attr_dev(input1, "type", "hidden");
    			attr_dev(input1, "name", "stars");
    			attr_dev(input1, "class", "svelte-1caadwo");
    			add_location(input1, file$3, 46, 6, 1396);
    			add_location(div, file$3, 40, 4, 1152);
    			attr_dev(label2, "for", "description");
    			attr_dev(label2, "class", "svelte-1caadwo");
    			add_location(label2, file$3, 49, 4, 1473);
    			attr_dev(textarea, "id", "description");
    			attr_dev(textarea, "name", "description");
    			textarea.required = true;
    			attr_dev(textarea, "class", "svelte-1caadwo");
    			add_location(textarea, file$3, 50, 4, 1524);
    			attr_dev(button, "class", "submit-button svelte-1caadwo");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$3, 52, 4, 1625);
    			add_location(p1, file$3, 53, 4, 1697);
    			attr_dev(form, "action", "https://formspree.io/f/xzbnydoe");
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "class", "svelte-1caadwo");
    			toggle_class(form, "padding-top-success", /*formStatus*/ ctx[3].length > 0);
    			add_location(form, file$3, 34, 2, 742);
    			attr_dev(section, "class", "submit-review-container svelte-1caadwo");
    			add_location(section, file$3, 31, 0, 668);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h2);
    			append_dev(section, t1);
    			append_dev(section, form);
    			append_dev(form, p0);
    			append_dev(p0, t2);
    			append_dev(form, t3);
    			append_dev(form, label0);
    			append_dev(form, t5);
    			append_dev(form, input0);
    			set_input_value(input0, /*title*/ ctx[0]);
    			append_dev(form, t6);
    			append_dev(form, label1);
    			append_dev(form, t8);
    			append_dev(form, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t9);
    			append_dev(div, input1);
    			set_input_value(input1, /*stars*/ ctx[1]);
    			append_dev(form, t10);
    			append_dev(form, label2);
    			append_dev(form, t12);
    			append_dev(form, textarea);
    			set_input_value(textarea, /*description*/ ctx[2]);
    			append_dev(form, t13);
    			append_dev(form, button);
    			append_dev(form, t15);
    			append_dev(form, p1);
    			append_dev(p1, t16);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[9]),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[5]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*formStatus*/ 8) set_data_dev(t2, /*formStatus*/ ctx[3]);

    			if (dirty & /*formStatus*/ 8) {
    				toggle_class(p0, "display-success", /*formStatus*/ ctx[3].length > 0);
    			}

    			if (dirty & /*title*/ 1 && input0.value !== /*title*/ ctx[0]) {
    				set_input_value(input0, /*title*/ ctx[0]);
    			}

    			if (dirty & /*Array, stars, setStars*/ 18) {
    				each_value = Array(5);
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$2, t9, get_each_context$2);
    			}

    			if (dirty & /*stars*/ 2) {
    				set_input_value(input1, /*stars*/ ctx[1]);
    			}

    			if (dirty & /*description*/ 4) {
    				set_input_value(textarea, /*description*/ ctx[2]);
    			}

    			if (dirty & /*formStatus*/ 8) set_data_dev(t16, /*formStatus*/ ctx[3]);

    			if (dirty & /*formStatus*/ 8) {
    				toggle_class(form, "padding-top-success", /*formStatus*/ ctx[3].length > 0);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ReviewForm', slots, []);
    	let title, stars = 0, description;
    	let formStatus = '';

    	function setStars(value) {
    		$$invalidate(1, stars = value);
    	}

    	async function handleSubmit(event) {
    		event.preventDefault();
    		const form = event.target;

    		const response = await fetch(form.action, {
    			method: form.method,
    			body: new FormData(form),
    			headers: { 'Accept': 'application/json' }
    		});

    		if (response.ok) {
    			$$invalidate(3, formStatus = 'Thank you for your review!');
    			$$invalidate(0, title = '');
    			$$invalidate(1, stars = 0);
    			$$invalidate(2, description = '');
    		} else {
    			$$invalidate(3, formStatus = 'Oops! There was a problem submitting your review.');
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ReviewForm> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		title = this.value;
    		$$invalidate(0, title);
    	}

    	const click_handler = i => setStars(i + 1);

    	function input1_input_handler() {
    		stars = this.value;
    		$$invalidate(1, stars);
    	}

    	function textarea_input_handler() {
    		description = this.value;
    		$$invalidate(2, description);
    	}

    	$$self.$capture_state = () => ({
    		title,
    		stars,
    		description,
    		formStatus,
    		setStars,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('stars' in $$props) $$invalidate(1, stars = $$props.stars);
    		if ('description' in $$props) $$invalidate(2, description = $$props.description);
    		if ('formStatus' in $$props) $$invalidate(3, formStatus = $$props.formStatus);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		stars,
    		description,
    		formStatus,
    		setStars,
    		handleSubmit,
    		input0_input_handler,
    		click_handler,
    		input1_input_handler,
    		textarea_input_handler
    	];
    }

    class ReviewForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ReviewForm",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\Reviews.svelte generated by Svelte v3.50.1 */

    const { console: console_1 } = globals;
    const file$2 = "src\\components\\Reviews.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (84:12) {#each Array(5) as _, i}
    function create_each_block_1$1(ctx) {
    	let span;
    	let t_value = (/*i*/ ctx[12] < /*review*/ ctx[7].stars ? '★' : '☆') + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "star svelte-w4bp7x");
    			add_location(span, file$2, 84, 14, 3443);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentIndex, visibleReviews*/ 3 && t_value !== (t_value = (/*i*/ ctx[12] < /*review*/ ctx[7].stars ? '★' : '☆') + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(84:12) {#each Array(5) as _, i}",
    		ctx
    	});

    	return block;
    }

    // (80:6) {#each reviews.slice(currentIndex, currentIndex + visibleReviews) as review (review.title)}
    function create_each_block$1(key_1, ctx) {
    	let div1;
    	let h3;
    	let t0_value = /*review*/ ctx[7].title + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let p;
    	let t3_value = /*review*/ ctx[7].description + "";
    	let t3;
    	let t4;
    	let each_value_1 = Array(5);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			add_location(h3, file$2, 81, 10, 3335);
    			attr_dev(div0, "class", "stars svelte-w4bp7x");
    			add_location(div0, file$2, 82, 10, 3370);
    			add_location(p, file$2, 87, 10, 3550);
    			attr_dev(div1, "class", "review-item svelte-w4bp7x");
    			toggle_class(div1, "all-space", /*visibleReviews*/ ctx[1] === 1);
    			add_location(div1, file$2, 80, 8, 3259);
    			this.first = div1;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(div1, t4);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*currentIndex, visibleReviews*/ 3 && t0_value !== (t0_value = /*review*/ ctx[7].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*reviews, currentIndex, visibleReviews*/ 7) {
    				each_value_1 = Array(5);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*currentIndex, visibleReviews*/ 3 && t3_value !== (t3_value = /*review*/ ctx[7].description + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*visibleReviews*/ 2) {
    				toggle_class(div1, "all-space", /*visibleReviews*/ ctx[1] === 1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(80:6) {#each reviews.slice(currentIndex, currentIndex + visibleReviews) as review (review.title)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let button0;
    	let t1;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let button1;
    	let mounted;
    	let dispose;
    	let each_value = /*reviews*/ ctx[2].slice(/*currentIndex*/ ctx[0], /*currentIndex*/ ctx[0] + /*visibleReviews*/ ctx[1]);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*review*/ ctx[7].title;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "◀";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "▶";
    			attr_dev(button0, "class", "svelte-w4bp7x");
    			add_location(button0, file$2, 77, 4, 3062);
    			attr_dev(div0, "class", "review-carousel svelte-w4bp7x");
    			add_location(div0, file$2, 78, 4, 3121);
    			attr_dev(button1, "class", "svelte-w4bp7x");
    			add_location(button1, file$2, 91, 4, 3626);
    			attr_dev(div1, "class", "carousel-container page-padding svelte-w4bp7x");
    			add_location(div1, file$2, 76, 2, 3011);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t2);
    			append_dev(div1, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*visibleReviews, reviews, currentIndex, Array*/ 7) {
    				each_value = /*reviews*/ ctx[2].slice(/*currentIndex*/ ctx[0], /*currentIndex*/ ctx[0] + /*visibleReviews*/ ctx[1]);
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, destroy_block, create_each_block$1, null, get_each_context$1);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Reviews', slots, []);

    	let reviews = [
    		{
    			title: "Simply the Best!",
    			stars: 5,
    			description: "I've had several tutors over the years, but none have matched the clarity and dedication I found here. Every session is thoughtfully tailored to my needs. Absolutely top-notch service that has far exceeded my expectations!"
    		},
    		{
    			title: "Very Satisfied",
    			stars: 4,
    			description: "The sessions are well-structured and efficient, though I wish we had more conversation practice."
    		},
    		{
    			title: "Good, but has room for improvement",
    			stars: 3,
    			description: "The tutoring service is quite beneficial, but sometimes the pace is a bit fast, and the homework can be overwhelming. I would appreciate more interactive exercises and timely feedback."
    		},
    		{
    			title: "Exceptional Quality",
    			stars: 5,
    			description: "As a non-native speaker, this course has been a revelation. Not only has my English improved, but my confidence in professional settings has skyrocketed."
    		},
    		{
    			title: "Decent Experience",
    			stars: 3,
    			description: "The tutor is knowledgeable, yet the classes can feel rushed. Slowing down would help ensure everyone fully understands the material."
    		},
    		{
    			title: "Fantastic SAT Prep",
    			stars: 5,
    			description: "After these prep classes, my SAT scores improved dramatically. The tutor was supportive, and the strategies provided for the math section were invaluable."
    		},
    		{
    			title: "Solid Tutoring",
    			stars: 4,
    			description: "Good tutoring overall. I appreciate the flexible scheduling and personalized attention, especially with my writing. It's been a great help for my college applications."
    		},
    		{
    			title: "Perfect for Public Speaking",
    			stars: 5,
    			description: "I used to dread public speaking, but thanks to this course, I've made significant improvements. The personal coaching and detailed feedback have been particularly beneficial. I feel much more poised and ready to tackle any speaking event."
    		}
    	];

    	let currentIndex = 0;
    	let visibleReviews = 3;

    	function updateVisibleReviews() {
    		console.log(window.innerWidth);

    		if (window.innerWidth < 768) {
    			$$invalidate(1, visibleReviews = 1);
    		} else {
    			$$invalidate(1, visibleReviews = 3);
    		}
    	}

    	console.log(visibleReviews);

    	onMount(() => {
    		updateVisibleReviews();
    		window.addEventListener('resize', updateVisibleReviews);

    		return () => {
    			window.removeEventListener('resize', updateVisibleReviews);
    		};
    	});

    	function handleNav(direction) {
    		if (direction === 'next') {
    			$$invalidate(0, currentIndex = (currentIndex + visibleReviews) % reviews.length);
    		} else {
    			$$invalidate(0, currentIndex = (currentIndex - visibleReviews + reviews.length) % reviews.length);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Reviews> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleNav('prev');
    	const click_handler_1 = () => handleNav('next');

    	$$self.$capture_state = () => ({
    		onMount,
    		reviews,
    		currentIndex,
    		visibleReviews,
    		updateVisibleReviews,
    		handleNav
    	});

    	$$self.$inject_state = $$props => {
    		if ('reviews' in $$props) $$invalidate(2, reviews = $$props.reviews);
    		if ('currentIndex' in $$props) $$invalidate(0, currentIndex = $$props.currentIndex);
    		if ('visibleReviews' in $$props) $$invalidate(1, visibleReviews = $$props.visibleReviews);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		currentIndex,
    		visibleReviews,
    		reviews,
    		handleNav,
    		click_handler,
    		click_handler_1
    	];
    }

    class Reviews extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reviews",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Services.svelte generated by Svelte v3.50.1 */
    const file$1 = "src\\components\\Services.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (27:28) {#each service.types as type}
    function create_each_block_1(ctx) {
    	let li;
    	let t_value = /*type*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-1osabzk");
    			add_location(li, file$1, 28, 32, 1248);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(27:28) {#each service.types as type}",
    		ctx
    	});

    	return block;
    }

    // (21:8) {#each services as service, index}
    function create_each_block(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let h30;
    	let t0_value = /*service*/ ctx[5].type + "";
    	let t0;
    	let t1;
    	let ul;
    	let t2;
    	let div1;
    	let h31;
    	let t3_value = /*service*/ ctx[5].type + "";
    	let t3;
    	let t4;
    	let p;
    	let t5_value = /*service*/ ctx[5].description + "";
    	let t5;
    	let div2_class_value;
    	let t6;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*service*/ ctx[5].types;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*index*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			h31 = element("h3");
    			t3 = text(t3_value);
    			t4 = space();
    			p = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			attr_dev(h30, "class", "svelte-1osabzk");
    			add_location(h30, file$1, 24, 24, 997);
    			attr_dev(ul, "class", "services-list svelte-1osabzk");
    			add_location(ul, file$1, 25, 24, 1046);
    			attr_dev(div0, "class", "card-front individual-list svelte-1osabzk");
    			add_location(div0, file$1, 23, 20, 931);
    			attr_dev(h31, "class", "svelte-1osabzk");
    			add_location(h31, file$1, 33, 24, 1430);
    			add_location(p, file$1, 35, 24, 1481);
    			attr_dev(div1, "class", "card-back svelte-1osabzk");
    			add_location(div1, file$1, 32, 20, 1381);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(`card-inner ${/*flipped*/ ctx[0][/*index*/ ctx[7]] ? 'is-flipped' : ''}`) + " svelte-1osabzk"));
    			add_location(div2, file$1, 22, 16, 845);
    			attr_dev(div3, "class", "card svelte-1osabzk");
    			toggle_class(div3, "card-clicked", /*flipped*/ ctx[0][/*index*/ ctx[7]]);
    			add_location(div3, file$1, 21, 12, 738);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h30);
    			append_dev(h30, t0);
    			append_dev(div0, t1);
    			append_dev(div0, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, h31);
    			append_dev(h31, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			append_dev(p, t5);
    			append_dev(div3, t6);

    			if (!mounted) {
    				dispose = listen_dev(div3, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*services*/ 2) {
    				each_value_1 = /*service*/ ctx[5].types;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*flipped*/ 1 && div2_class_value !== (div2_class_value = "" + (null_to_empty(`card-inner ${/*flipped*/ ctx[0][/*index*/ ctx[7]] ? 'is-flipped' : ''}`) + " svelte-1osabzk"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*flipped*/ 1) {
    				toggle_class(div3, "card-clicked", /*flipped*/ ctx[0][/*index*/ ctx[7]]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(21:8) {#each services as service, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section;
    	let h2;
    	let t1;
    	let div;
    	let each_value = /*services*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h2 = element("h2");
    			h2.textContent = "Services";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "section-title");
    			add_location(h2, file$1, 18, 4, 606);
    			attr_dev(div, "class", "lists-container svelte-1osabzk");
    			add_location(div, file$1, 19, 4, 651);
    			attr_dev(section, "id", "services");
    			attr_dev(section, "class", "page-padding svelte-1osabzk");
    			add_location(section, file$1, 17, 0, 556);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h2);
    			append_dev(section, t1);
    			append_dev(section, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*flipped, toggleFlip, services*/ 7) {
    				each_value = /*services*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Services', slots, []);
    	const services = getContext('services');
    	let flipped = [false, false, false];

    	const toggleFlip = index => {
    		$$invalidate(0, flipped[index] = !flipped[index], flipped);
    	};

    	const handleLiClick = e => {
    		// jump to #contact section and stop propagation
    		e.stopPropagation();

    		clickedTopic.set(e.target.innerText);
    		document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Services> was created with unknown prop '${key}'`);
    	});

    	const click_handler = index => toggleFlip(index);

    	$$self.$capture_state = () => ({
    		getContext,
    		services,
    		clickedTopic,
    		flipped,
    		toggleFlip,
    		handleLiClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('flipped' in $$props) $$invalidate(0, flipped = $$props.flipped);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [flipped, services, toggleFlip, click_handler];
    }

    class Services extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Services",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.50.1 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let t0;
    	let services_1;
    	let t1;
    	let about;
    	let t2;
    	let contact;
    	let t3;
    	let reviews;
    	let t4;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	services_1 = new Services({ $$inline: true });
    	about = new About({ $$inline: true });
    	contact = new Contact({ $$inline: true });
    	reviews = new Reviews({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(services_1.$$.fragment);
    			t1 = space();
    			create_component(about.$$.fragment);
    			t2 = space();
    			create_component(contact.$$.fragment);
    			t3 = space();
    			create_component(reviews.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			add_location(main, file, 25, 2, 1807);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			mount_component(services_1, main, null);
    			append_dev(main, t1);
    			mount_component(about, main, null);
    			append_dev(main, t2);
    			mount_component(contact, main, null);
    			append_dev(main, t3);
    			mount_component(reviews, main, null);
    			append_dev(main, t4);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(services_1.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			transition_in(reviews.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(services_1.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			transition_out(reviews.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(services_1);
    			destroy_component(about);
    			destroy_component(contact);
    			destroy_component(reviews);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	let services = [
    		{
    			type: "English",
    			description: "Offering personalized English language tutoring tailored to every learning stage—from beginners eager to lay a strong foundation, to advanced learners looking to refine their fluency. Courses are designed to suit needs in mastering Business English or improving conversational skills.",
    			types: [
    				"Beginner Classes",
    				"Intermediate Classes",
    				"Advanced Classes",
    				"Business English",
    				"Conversation Classes"
    			]
    		},
    		{
    			type: "SAT Prep",
    			description: "Provides comprehensive preparation covering all sections of the SAT: Reading, Writing, and Math. The approach combines strategic review with practical test-taking strategies, ensuring full preparation on exam day.",
    			types: ["Reading", "Writing", "Math"]
    		},
    		{
    			type: "Advanced Tutoring",
    			description: "Advanced tutoring in Literary Analysis, Professional Writing, and Public Speaking. Whether dissecting complex texts, crafting written communications, or delivering speeches, guidance is designed to elevate skills and confidence.",
    			types: ["Literary Analysis", "Professional Writing", "Public Speaking"]
    		}
    	];

    	let clickedTopic = "ART";

    	let updateClickedTopic = topic => {
    		clickedTopic = topic;
    	};

    	setContext('clickedTopic', { clickedTopic, updateClickedTopic });
    	setContext('services', services);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		About,
    		Contact,
    		Footer,
    		Header,
    		ReviewForm,
    		Reviews,
    		Services,
    		setContext,
    		services,
    		clickedTopic,
    		updateClickedTopic
    	});

    	$$self.$inject_state = $$props => {
    		if ('services' in $$props) services = $$props.services;
    		if ('clickedTopic' in $$props) clickedTopic = $$props.clickedTopic;
    		if ('updateClickedTopic' in $$props) updateClickedTopic = $$props.updateClickedTopic;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        name: "world",
      },
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
