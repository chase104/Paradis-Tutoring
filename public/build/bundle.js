
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
    const file$3 = "src\\components\\Contact.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (67:10) {#each service.types as type}
    function create_each_block_1$1(ctx) {
    	let option;
    	let t_value = /*type*/ ctx[16] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*type*/ ctx[16];
    			option.value = option.__value;
    			add_location(option, file$3, 67, 12, 2052);
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
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(67:10) {#each service.types as type}",
    		ctx
    	});

    	return block;
    }

    // (65:8) {#each services as service}
    function create_each_block$1(ctx) {
    	let optgroup;
    	let each_value_1 = /*service*/ ctx[13].types;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			optgroup = element("optgroup");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(optgroup, "label", /*service*/ ctx[13].type);
    			add_location(optgroup, file$3, 65, 8, 1966);
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
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(65:8) {#each services as service}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
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
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h2 = element("h2");
    			h2.textContent = "Contact";
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
    			attr_dev(h2, "class", "section-title contact-title svelte-27sw9m");
    			add_location(h2, file$3, 44, 4, 1080);
    			attr_dev(p, "class", "success-msg svelte-27sw9m");
    			toggle_class(p, "display-success", /*formSubmitted*/ ctx[1]);
    			add_location(p, file$3, 48, 8, 1282);
    			attr_dev(label0, "for", "name");
    			add_location(label0, file$3, 51, 10, 1462);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "class", "svelte-27sw9m");
    			add_location(input0, file$3, 52, 8, 1503);
    			attr_dev(div0, "class", "label-input-container svelte-27sw9m");
    			add_location(div0, file$3, 49, 8, 1413);
    			attr_dev(label1, "for", "email");
    			add_location(label1, file$3, 55, 6, 1623);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "class", "svelte-27sw9m");
    			add_location(input1, file$3, 56, 6, 1663);
    			attr_dev(div1, "class", "label-input-container svelte-27sw9m");
    			add_location(div1, file$3, 54, 8, 1580);
    			attr_dev(label2, "for", "topic");
    			add_location(label2, file$3, 60, 6, 1777);
    			option.__value = "";
    			option.value = option.__value;
    			add_location(option, file$3, 63, 8, 1874);
    			attr_dev(select, "name", "topic");
    			attr_dev(select, "class", "svelte-27sw9m");
    			if (/*topic*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[10].call(select));
    			add_location(select, file$3, 62, 6, 1824);
    			attr_dev(div2, "class", "label-input-container svelte-27sw9m");
    			add_location(div2, file$3, 58, 2, 1732);
    			attr_dev(label3, "for", "message");
    			add_location(label3, file$3, 76, 6, 2238);
    			attr_dev(textarea, "class", "message svelte-27sw9m");
    			attr_dev(textarea, "name", "message");
    			attr_dev(textarea, "placeholder", "Tell me a bit about what you're looking for");
    			attr_dev(textarea, "rows", "5");
    			add_location(textarea, file$3, 78, 6, 2284);
    			attr_dev(div3, "class", "label-input-container svelte-27sw9m");
    			add_location(div3, file$3, 74, 6, 2193);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-27sw9m");
    			add_location(button, file$3, 80, 6, 2448);
    			attr_dev(form, "action", "https://formspree.io/f/xqkrwajl");
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "class", "svelte-27sw9m");
    			toggle_class(form, "padding-top-success", /*formSubmitted*/ ctx[1]);
    			add_location(form, file$3, 47, 4, 1142);
    			attr_dev(section, "id", "contact");
    			attr_dev(section, "class", "svelte-27sw9m");
    			add_location(section, file$3, 43, 2, 1052);
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
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\Header.svelte generated by Svelte v3.50.1 */

    const file$2 = "src\\components\\Header.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let h1;
    	let t0;
    	let span;
    	let t2;
    	let div;
    	let h3;
    	let t4;
    	let p;
    	let t6;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			t0 = text("Paradis ");
    			span = element("span");
    			span.textContent = "Tutoring";
    			t2 = space();
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Let your potential unfold";
    			t4 = space();
    			p = element("p");
    			p.textContent = "At Paradis Tutoring, we're committed to helping you excel in all aspects of English and communication. Led by Mr. Paradis, a seasoned educator with over 10 years of experience across multiple continents, our tutoring services are designed to boost your abilities and confidence in professional writing, SAT preparation, literary analysis, and public speaking.";
    			t6 = space();
    			button = element("button");
    			button.textContent = "My Services";
    			attr_dev(span, "class", "svelte-odssj1");
    			add_location(span, file$2, 16, 16, 451);
    			attr_dev(h1, "class", "site-title svelte-odssj1");
    			add_location(h1, file$2, 15, 4, 410);
    			attr_dev(h3, "class", "svelte-odssj1");
    			add_location(h3, file$2, 20, 8, 537);
    			add_location(p, file$2, 23, 8, 605);
    			attr_dev(div, "class", "flex-column sub-header svelte-odssj1");
    			add_location(div, file$2, 19, 4, 491);
    			attr_dev(button, "class", "flashing-button svelte-odssj1");
    			attr_dev(button, "aria-label", "Learn more about my tutoring services");
    			add_location(button, file$2, 27, 4, 1013);
    			attr_dev(section, "class", "background flex-column svelte-odssj1");
    			add_location(section, file$2, 14, 0, 364);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			append_dev(h1, t0);
    			append_dev(h1, span);
    			append_dev(section, t2);
    			append_dev(section, div);
    			append_dev(div, h3);
    			append_dev(div, t4);
    			append_dev(div, p);
    			append_dev(section, t6);
    			append_dev(section, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", scrollToServices, false, false, false),
    					listen_dev(button, "keypress", handleKeyPress, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
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

    function scrollToServices() {
    	const aboutSection = document.querySelector('#services');
    	aboutSection.scrollIntoView({ behavior: 'smooth' });
    }

    function handleKeyPress(event) {
    	if (event.key === 'Enter' || event.key === 'Space') {
    		scrollToServices();
    		event.preventDefault();
    	}
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ scrollToServices, handleKeyPress });
    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
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
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (30:16) {#each service.types as type}
    function create_each_block_1(ctx) {
    	let li;
    	let t_value = /*type*/ ctx[8] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*type*/ ctx[8]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-53k2vk");
    			add_location(li, file$1, 30, 20, 925);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(li, "click", click_handler, false, false, false),
    					listen_dev(li, "keypress", /*handleKeyPress*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(30:16) {#each service.types as type}",
    		ctx
    	});

    	return block;
    }

    // (26:4) {#each services as service}
    function create_each_block(ctx) {
    	let section;
    	let h3;
    	let t0_value = /*service*/ ctx[5].type + "";
    	let t0;
    	let t1;
    	let ul;
    	let t2;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*service*/ ctx[5].types;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr_dev(h3, "class", "svelte-53k2vk");
    			add_location(h3, file$1, 27, 12, 793);
    			attr_dev(ul, "class", "services-list svelte-53k2vk");
    			add_location(ul, file$1, 28, 12, 830);
    			attr_dev(section, "class", "individual-list svelte-53k2vk");
    			add_location(section, file$1, 26, 8, 711);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h3);
    			append_dev(h3, t0);
    			append_dev(section, t1);
    			append_dev(section, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(section, t2);

    			if (!mounted) {
    				dispose = listen_dev(section, "click", /*click_handler_1*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*handleTypeClick, services, handleKeyPress*/ 7) {
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
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(26:4) {#each services as service}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section;
    	let h2;
    	let t1;
    	let div;
    	let each_value = /*services*/ ctx[0];
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
    			add_location(h2, file$1, 22, 4, 592);
    			attr_dev(div, "class", "lists-container svelte-53k2vk");
    			add_location(div, file$1, 23, 4, 637);
    			attr_dev(section, "id", "services");
    			attr_dev(section, "class", "svelte-53k2vk");
    			add_location(section, file$1, 21, 0, 563);
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
    			if (dirty & /*scrollToContact, services, handleTypeClick, handleKeyPress*/ 7) {
    				each_value = /*services*/ ctx[0];
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

    function scrollToContact() {
    	const aboutSection = document.querySelector('#contact');
    	aboutSection.scrollIntoView({ behavior: 'smooth' });
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Services', slots, []);
    	const services = getContext('services');

    	let handleTypeClick = type => {
    		clickedTopic.set(type);
    	};

    	function handleKeyPress(event) {
    		if (event.key === 'Enter' || event.key === 'Space') {
    			handleTypeClick(event.target.innerText);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Services> was created with unknown prop '${key}'`);
    	});

    	const click_handler = type => handleTypeClick(type);
    	const click_handler_1 = () => scrollToContact();

    	$$self.$capture_state = () => ({
    		getContext,
    		services,
    		clickedTopic,
    		scrollToContact,
    		handleTypeClick,
    		handleKeyPress
    	});

    	$$self.$inject_state = $$props => {
    		if ('handleTypeClick' in $$props) $$invalidate(1, handleTypeClick = $$props.handleTypeClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [services, handleTypeClick, handleKeyPress, click_handler, click_handler_1];
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
    	let contact;
    	let current;
    	header = new Header({ $$inline: true });
    	services_1 = new Services({ $$inline: true });
    	contact = new Contact({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(services_1.$$.fragment);
    			t1 = space();
    			create_component(contact.$$.fragment);
    			attr_dev(main, "class", "svelte-1d18ysu");
    			add_location(main, file, 20, 2, 893);
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
    			mount_component(contact, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(services_1.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(services_1.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(services_1);
    			destroy_component(contact);
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
    			types: [
    				"Beginner Classes",
    				"Intermediate Classes",
    				"Advanced Classes",
    				"Business English",
    				"Conversation Classes"
    			]
    		},
    		{
    			type: "Exam Preparation",
    			types: ["IELTS", "TOEFL", "TOEIC", "Cambridge English Exams", "SAT"]
    		},
    		{
    			type: "Academic Tutoring",
    			types: [
    				"Mathematics",
    				"Science",
    				"History",
    				"Geography",
    				"Literature",
    				"Writing",
    				"Research",
    				"Study Skills"
    			]
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
    		Contact,
    		Header,
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
