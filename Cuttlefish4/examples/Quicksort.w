quicksort = fn:
    [] -> []
    [Num] list -> quicksort list[1..][fn: $ < list[0]] ++ list[0] ++ quicksort list[1..][fn: $ >= list[0]]


###
[
    assignment {
        assignments = [
            singleassignment {
                assignee = ref {
                    id = 'quicksort'
                }
                value = function {
                    patterns = [
                        pattern {
                            input = [
                                list {}
                            ]
                            output = [
                                return {
                                    value = list {}
                                }
                            ]
                        }
                        pattern {
                            input = [
                                patternelem {
                                    type = listtype {
                                        type = 'Num'
                                    }
                                    id = 'list'
                                }
                            ]
                            output = [
                                return {
                                    concat {
                                        left = application {
                                            func = ref {
                                                id = 'quicksort'
                                            }
                                            output = [
                                                filter {
                                                    list = slice {
                                                        list = ref {
                                                            id = 'list'
                                                        }
                                                        slicer = discreterange {
                                                            start = num {
                                                                value = 1
                                                            }
                                                            includestart = true
                                                        }
                                                    }
                                                    func = function {
                                                        output = [
                                                            return {
                                                                value = lessthan {
                                                                    left = ref {
                                                                        id = '$'
                                                                    }
                                                                    right = elementof {
                                                                        parent = ref {
                                                                            id = 'list'
                                                                        }
                                                                        childId = num {
                                                                            value = 0
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                        right = concat {
                                            left = elementof {
                                                parent = ref {
                                                    id = 'list'
                                                }
                                                childId = num {
                                                    value = 0
                                                }
                                            }
                                            right = application {
                                                func = ref {
                                                    id = 'quicksort'
                                                }
                                                output = [
                                                    filter {
                                                        list = slice {
                                                            list = ref {
                                                                id = 'list'
                                                            }
                                                            slicer = discreterange {
                                                                start = num {
                                                                    value = 1
                                                                }
                                                                includestart = true
                                                            }
                                                        }
                                                        func = function {
                                                            output = [
                                                                return {
                                                                    value = geq {
                                                                        left = ref {
                                                                            id = '$'
                                                                        }
                                                                        right = elementof {
                                                                            parent = ref {
                                                                                id = 'list'
                                                                            }
                                                                            childId = num {
                                                                                value = 0
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    }
]