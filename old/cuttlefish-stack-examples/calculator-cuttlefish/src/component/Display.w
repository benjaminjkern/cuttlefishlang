export Display = Component: { value } ->
    this.styles = match: component
        | component.hasClass "component-display" ->
            backgroundColor = Color '#858694'
            color = .white
            textAlign = .right
            fontWeight = 200
            flex = [0, 0, .auto]
            width = component.parent.width
        | component.parent.hasClass "component-display" ->
            fontSize = 2.5 * relativeFontSize
            padding = [0.2, 0.7, 0.1, 0.5] |> fn: $ * relativeFontSize

    View:
        class = "component-display"
        View: Text: value
