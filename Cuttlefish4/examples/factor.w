
# Factor.w, factors an integer pretty fricken efficiently but not necessarily as efficiently as possible

factor = fn: Int n, Int m
    | n == 1 -> []
    | m * m <= n
        | n %= m -> m ++ factor (n // m) m
        | -> factor n (m + (m == 2 ? 1 : 2))
    | -> [n]

print factor 120510923571235 # uh 

### expected ast
[
    assignment {
        id = 'factor'
        value = function {
            patterns = [
                pattern {
                    input = [
                        patternelem {
                            type = 'Int'
                            id = 'n'
                        }
                        patternelem {
                            type = 'Int'
                            id = 'm'
                            default = num {
                                value = 2
                            }
                        }
                    ]
                    cases = [
                        case {
                            test = equals {
                                left = ref {
                                    id = 'n'
                                }
                                right = num {
                                    value = 1
                                }
                            }
                            output = [
                                return {
                                    object = list {
                                        elems = []
                                    }
                                }
                            ]
                        }
                        case {
                            test = leq {
                                left = mult {
                                    left = ref {
                                        id = 'm'
                                    }
                                    right = ref {
                                        id = 'm'
                                    }
                                }
                                right = ref {
                                    id = 'n'
                                }
                            }
                            cases = [
                                case {
                                    test = isdivisible {
                                        left = ref {
                                            id = 'n'
                                        }
                                        right = ref {
                                            id = 'm'
                                        }
                                    }
                                    output = [
                                        return {
                                            object = concat {
                                                left = ref {
                                                    id = 'm'
                                                }
                                                right = application {
                                                    func = ref {
                                                        id = 'factor'
                                                    }
                                                    input = [
                                                        intdiv {
                                                            left = ref {
                                                                id = 'n'
                                                            }
                                                            right = ref {
                                                                id = 'm'
                                                            }
                                                        }
                                                        ref {
                                                            id = 'm'
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    ]
                                }
                                case {
                                    test = bool {
                                        value = true
                                    }
                                    output = [
                                        application {
                                            func = ref {
                                                id = 'factor'
                                                input = [
                                                    ref {
                                                        id = 'n'
                                                    }
                                                    add {
                                                        left = ref {
                                                            id = 'm'
                                                        }
                                                        right = ternary {
                                                            test = equals {
                                                                left = ref {
                                                                    id = 'm'
                                                                }
                                                                right = num {
                                                                    value = 2
                                                                }
                                                            }
                                                            iftrue = num {
                                                                value = 1
                                                            }
                                                            iffalse = num {
                                                                value = 2
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                        case {
                            test = bool {
                                value = true
                            }
                            output = [
                                return {
                                    object = list {
                                        elems = [
                                            ref {
                                                id = 'n'
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }
    print {
        toPrint = application {
            func = ref {
                id = 'func'
            }
            input = [
                num {
                    value = 20
                }
            ]
        }
    }
]