Range = pattern:
	'{RangeStart a}{RangeInside b}{RangeEnd c}' ->

RangeInside = pattern:
	'{Num start}\.\.({Num step}\.\.)?{Num end}?' ->
	'{Num start}\.\.\.{Num end}?'


RangeStart = pattern:
	'[' or '(' -> includeStart = $ == '['

RangeEnd = pattern:
	']' or ')' -> includeEnd = $ == ']'
