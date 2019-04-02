# Implementing FormManager in Components

FormManager (**"FM"**) can be used any way you want.
In React, it will often be created in the 'container component' 
that handles all the data and view logic for the form 'presentation components'.
Each presentational component then requires _only a single passed prop_ - 
the FM object. This can replaces all the data-props, event-handlers, 
and error-messages that normally must be passed down. 

If you require additional event listeners, this can also be done through FM.
Plus, FM has its own 'state', which you can use for _anything_, like user data, 
picklist arrays, helper functions, etc. 
Attaching all form-related items to the FM object is logical, and helps to
eliminate confusing prop-drilling. Every component that received the FM prop 
has access to everything related to that form.

Note that the imported FM library is a factory function. 
_Each time you call it_, it will returns a _new_, unique FormManager object. 
If you wish, you _can_ use the `new` keyword when creating an FM instance, 
but it is not necessary or recommended.


## Form Configuration

This page does not cover the configuration for the form.

See 
**[FormManager Configuration](https://github.com/allpro/react-fluid-grid/blob/master/docs/Configuration.md)** 
for that information.


## Implementing in a 'Container' Component

Below are 2 examples: one implementing FormManager in a class component and one 
implementing inside a functional component using hooks. 
These examples show only basic FM configuration to keep it simple.

#### How to handle render optimization

_Dumb_ form presentation components often rely on a container component for 
rendering logic. 
**However, _if_ a child component uses PureComponent or memoization to 
optimize updates, then at least one 'prop' must change to trigger an update.** 
The FormManager 'object' never changes, and FM eliminate the need to pass 
individual values, therefore no new prop value is passed. 
To address this, FM writes a unique revision-number into state each time it 
does a state update. This value can be passed to child components to force an 
update. This optional prop is shown in these examples, but you may not need it.

### Class Component

The FormManager instance is created and cached as a property of the class in 
the constructor. The class-instance ('this') is passed as first argument so FM 
can call `setState()` whenever data changes and the component must re-render.
 FM writes a single value into state that looks like `{ formRevision: 325 }`

```javascript static
import React, { Fragment } from 'react';
import FormManager from 'form-manager';

import FormPartOne from './FormPartOne';
import FormPartTwo from './FormPartTwo';

const formConfig = {
    // Config validation and other options as desired - everything is optional
};

export default class MyComponent extends React.Component {
    constructor(props) {
        super(props);

        // Form-data can be set from props, if applicable
        this.form = FormManager(this, formConfig, props.data);
    }

    render() {
        const { form } = this;
        const { formRevision } = this.state

        return (
            <Fragment>
                <FormPartOne form={form} rev={formRevision} />
                <FormPartTwo form={form} rev={formRevision} />
            </Fragment>
        )
    }
}

```
### Functional Component using Hooks

The FormManager instance is cached by the `useRef()` hook. A `setSomething` 
method is passed as first argument so FM can call `setSomething()` for updates.
For hooks, FM writes the bare formRevision number to make it easy to use.

NOTE that the render output here is _identical_ to the Class example above.

```javascript static
import React, { Fragment, useState, useRef } from 'react';
import FormManager from 'form-manager';

import FormPartOne from './FormPartOne';
import FormPartTwo from './FormPartTwo';

const formConfig = {
    // Config validation and other options as desired - everything is optional
};

export default function MyComponent(props) {
    // Create a state hook for FM to use; pass the setter to the FM factory.
    // The naming of these states does not matter; use whatever you want.
    const [ rev, setRevision ] = useState(0)
    const [ form ] = useState(() => FormManager(setRevision, formConfig, props.data))

    return (
        <Fragment>
            <FormPartOne form={form} rev={rev} />
            <FormPartTwo form={form} rev={rev} />
        </Fragment>
    )
}
```

## Implementing in a 'Presentation' Component

This example shows a form with a few fields on it. It does not show cosmetic
props like `classes` or `fullWidth`, which you can add as normal. The FM
props shown here _only_ handles props like `name`, `value` and event-handlers.

This sample includes the fieldname `user/gender`. This indicates the data has
 gender _nested_ inside a user object. Use slashes or dots, (`user.gender`), to
  refer to values nested at _any depth_. OR you can set an `aliasName` in the 
  field-config, (eg: `gender`), and then use this alias-name in your code.

Note that some MUI elements, like `TextField` don't need `FormControl` and 
`FormTextHelper` components **because it auto-generates these**!

```javascript static
import React, { Fragment } from 'react';

const MyForm = (props) => {
    const form = props.form;

    return (
        <Fragment>

            <FormControl
                error={form.hasErrors('category')}
            >
                <InputLabel htmlFor="category">Category</InputLabel>
                <Select
                    {...form.dataProps('category')}
                    input={<Input name="form-category" id="form-category"/>}
                >
                    <MenuItem value="" />
                    { form.state('categoryList').map(item =>
                        <MenuItem value={item.value} key={item.value}>
                            {item.display}
                        </MenuItem>
                    )}
                </Select>
                <FormHelperText className="hide-when-empty">
                    {form.error('category')}
                </FormHelperText>
            </FormControl>

            <TextField
                label="Details of Issue"
                {...form.dataProps('message')}
                {...form.errorProps('message')}
                inputRef={ (el) => { this.messageInput = el} }
            />

            <FormControl
                component="fieldset"
                error={form.hasErrors('user/gender')}
            >
                <FormLabel type="title" component="legend">
                    Select your gender
                </FormLabel>
                <RadioGroup
                    {...form.dataProps('user/gender')}
                >
                    <FormControlLabel value="male" label="Male" control={<Radio/>} />
                    <FormControlLabel value="female" label="Female" control={<Radio/>} />
                    <FormControlLabel value="other" label="Other" control={<Radio/>} />
                </RadioGroup>
                <FormHelperText className="hide-when-empty">
                    {form.error('user/gender')}
                </FormHelperText>
            </FormControl>

        </Fragment>
    )
}
```
