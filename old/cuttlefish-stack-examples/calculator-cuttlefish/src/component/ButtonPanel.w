CalculatorButton = import './CalculatorButton'

export ButtonPanel = Component: { clickHandler } ->
    handleClick = fn: buttonName -> clickHandler buttonName

    this.styles = match: component
        | component.parent.hasClass "component-button-panel" ->
            width = component.width
            marginBottom = 1
            flex = "1 0 auto"
            display = .flex
        | component.hasClass "component-button-panel" ->
            backgroundColor = Color '#858694'
            display = .flex
            flexDirection = .row
            flexWrap = .wrap
            flex = "1 0 auto" # TODO MAKE THIS BETTER

    View:
        class = "component-button-panel"
        
        # There would ideally be a cuttlefish button of the same name as this but whatever
        View:
            CalculatorButton: name = "AC"; clickHandler = handleClick
            CalculatorButton: name = "+/-"; clickHandler = handleClick
            CalculatorButton: name = "%"; clickHandler = handleClick
            CalculatorButton: name = "÷"; clickHandler = handleClick; orange = true

        View:
            CalculatorButton: name = "7"; clickHandler = handleClick
            CalculatorButton: name = "8"; clickHandler = handleClick
            CalculatorButton: name = "9"; clickHandler = handleClick
            CalculatorButton: name = "x"; clickHandler = handleClick; orange = true
        
        View:
            CalculatorButton: name = "4"; clickHandler = handleClick
            CalculatorButton: name = "5"; clickHandler = handleClick
            CalculatorButton: name = "6"; clickHandler = handleClick
            CalculatorButton: name = "-"; clickHandler = handleClick; orange = true

        View:
            CalculatorButton: name = "1"; clickHandler = handleClick
            CalculatorButton: name = "2"; clickHandler = handleClick
            CalculatorButton: name = "3"; clickHandler = handleClick
            CalculatorButton: name = "+"; clickHandler = handleClick; orange = true

        View:
            CalculatorButton: name = "0"; clickHandler = handleClick; wide = true
            CalculatorButton: name = "."; clickHandler = handleClick
            CalculatorButton: name = "="; clickHandler = handleClick; orange = true

