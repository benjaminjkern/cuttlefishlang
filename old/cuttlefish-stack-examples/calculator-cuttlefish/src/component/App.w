{ Display, ButtonPanel } = import './'
calculate = import '~/logic/calculate'

# Only one export statement is allowed
export App = Component:
    this.state = obj:
        total = null
        next = null
        operation = null

    handleClick = fn: buttonName ->
        this.state = calculate(this.state, buttonName)
        this.render()


    # TODO get away from default CSS in favor of something that only requires one good solution
    # i.e. all styles default to flex, height using component direct references rather than "100%" or some bullshit like that

    # Also component can be passed as an input to this stylesheet, basically every component is passed through this stylesheet

    # 'this' is required when talking to a property in View that is NOT created here, if you dont use 'this' then it assumes it doesnt exist and can overwrite within this scope
    this.styles = match: component
        | component.hasClass "component-app" ->
            # Uses swift-style static type suggestion, i.e. it knows what options display can be. This is better than just doing strings for all of these
            display = .flex
            flex-direction = .column
            flexWrap = .wrap
            height = component.height

    View:
        class = "component-app"
        Display:
            value = state.next || state.total || "0"
        ButtonPanel:
            clickHandler = handleClick
