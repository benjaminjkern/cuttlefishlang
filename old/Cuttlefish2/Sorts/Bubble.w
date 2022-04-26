sort = prc: [Key] a ->
    n = a.length
    for [ 0 .. n ): i ->
        exchanges = 0
        for [ n-1 .. -1 .. i ): j ->
            a[j], a[j-1] = a[j-1], a[j]
            exchanges += 1
        if exchanges == 0: break
    return a

main = prc:
    print (sort (clone $))


[
    assignment {
        id = 'sort'
        value = process {
            patterns = [
                pattern {
                    input = [
                        patternelem {
                            type = listtype {
                                type = 'Key'
                            }
                            id = 'a'
                        }
                    ]
                    output = [
                        assignment {
                            id = 'n'
                            value = elementof {
                                parent = ref {
                                    id = 'a'
                                }
                                childId = 'length'
                            }
                        }
                        application {
                            func = 'for'
                            input = [
                                discreterange {
                                    start = num {
                                        value = 0
                                    }
                                    includestart = true
                                    end = ref {
                                        id = 'n'
                                    }
                                    includeend = false
                                }
                                process {
                                    patterns = [
                                        pattern {
                                            input = [
                                                patternelem {
                                                    id = 'i'
                                                }
                                            ]
                                            output = [
                                                assignment {
                                                    id = 'exchanges'
                                                    value = num {
                                                        value = 0
                                                    }
                                                }
                                                application {
                                                    func = ref {
                                                        id = 'for'
                                                        input = [
                                                            discreterange {
                                                                start = num {
                                                                    value = sub {
                                                                        left = ref {
                                                                            id = 'n'
                                                                        }
                                                                        right = num {
                                                                            value = 1
                                                                        }
                                                                    }
                                                                }
                                                                includestart = true
                                                                count = num {
                                                                    value = -1
                                                                }
                                                                end = ref {
                                                                    id = 'n'
                                                                }
                                                                includeend = false
                                                            }
                                                            process {
                                                                patterns = [
                                                                    pattern {
                                                                        input = [
                                                                            patternelem {
                                                                                id = 'j'
                                                                            }
                                                                        ]
                                                                    }
                                                                    output = [
                                                                        assignment {
                                                                            assignments = [
                                                                                singleassignment {
                                                                                    assignee = elementof {
                                                                                        parent = ref {
                                                                                            id = 'a'
                                                                                        }
                                                                                        childId = ref {
                                                                                            id = 'j'
                                                                                        }
                                                                                    }
                                                                                    value = elementof {
                                                                                        parent = ref {
                                                                                            id = 'a'
                                                                                        }
                                                                                        childId = sub {
                                                                                            left = ref {
                                                                                                id = 'j'
                                                                                            }
                                                                                            right = num {
                                                                                                value = 1
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                                singleassignment {
                                                                                    assignee = elementof {
                                                                                        parent = ref {
                                                                                            id = 'a'
                                                                                        }
                                                                                        childId = sub {
                                                                                            left = ref {
                                                                                                id = 'j'
                                                                                            }
                                                                                            right = num {
                                                                                                value = 1
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    value = elementof {
                                                                                        parent = ref {
                                                                                            id = 'a'
                                                                                        }
                                                                                        childId = ref {
                                                                                            id = 'j'
                                                                                        }
                                                                                    }
                                                                                }
                                                                            ]
                                                                        }
                                                                        reassignment {
                                                                            op = 'add'
                                                                            assignee = ref {
                                                                                id = 'exchanges'
                                                                            }
                                                                            value = num {
                                                                                value = 1
                                                                            }
                                                                        }
                                                                    ]
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                }
                                                if {
                                                    test = equals {
                                                        left = ref {
                                                            id = 'exchanges'
                                                        }
                                                        right = num {
                                                            value = 0
                                                        }
                                                    }
                                                    iftrue = break {}
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                        return {
                            object = ref {
                                id = 'a'
                            }
                        }
                    ]
                }
            ]
        }
    }
    assignment {
        id = 'main'
        value = process {
            output = [
                print {
                    toprint = application {
                        func = ref {
                            id = 'sort'
                        }
                        input = [
                            application {
                                func = ref {
                                    id = 'clone'
                                }
                                input = [
                                    ref {
                                        id = '$'
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    }
]