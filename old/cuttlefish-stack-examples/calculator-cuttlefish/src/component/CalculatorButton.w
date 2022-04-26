export CalculatorButton = Component: { name, orange, wide, clickHandler } ->
    handleClick = fn: clickHandler name

    # fn vs match, fn return after first match (unless explicitly told to continue), matches run all code that the inputs match (unless explicitly told to break)
    this.styles = match: component
        | component.hasClass "component-button"
            | ->
                display = .inlineFlex
                width = component.parent.width / 4
                flex = [1, 0, .auto]
            | component.hasClass "wide" ->
                width = component.parent.width / 2
            | component.type == button
                | ->
                    backgroundColor = Color "#e0e0e0"
                    border = 0
                    fontSize = 1.5 * relativeFontSize
                    margin = [0, 1, 1, 0]
                    flex = [1, 0, .auto]
                    padding = 0
                | component.isLastChild -> marginRight = 0
                | component.hasClass "orange" ->
                    backgroundColor = Color "#f5923e"
                    color = .white

    View:
        classes = ["component-button", orange ? "orange" : "", white ? "white" : ""]

        Button:
            onClick = handleClick
            # Text is necessary, otherwise it is not rendered at all
            Text: name
