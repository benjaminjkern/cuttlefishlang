import * from socket

main = prc: String+ args
    | args.length != 1 -> print "Pass the server IP as the sole command line argument"
    | ->
        socket = (Socket: args[0]) 59898
        print "Enter lines of text then Ctrl+D or Ctrl+C to quit"
        repeat:
            socket.output(input())
            print socket.input()

## AST

[
    import {
        package = 'socket'
    }
    assignment {
        assignments = [
            singleassignment {
                assignee = ref {
                    id = 'main'
                }
                value = process {
                    patterns = [
                        pattern {
                            input = [
                                patternelem {
                                    type = 'String'
                                    multiple = true
                                    id = 'args'
                                }
                            ]
                            cases = [
                                case {
                                    test = notequals {
                                        left = elementof {
                                            parent = ref {
                                                id = 'args'
                                            }
                                            childId = 'length'
                                        }
                                        right = num {
                                            value = 1
                                        }
                                    }
                                    output = [
                                        print {
                                            toprint = string {
                                                value = "Pass the server IP as the sole command line argument"
                                            }
                                        }
                                    ]
                                }
                                case {
                                    test = bool {
                                        value = true
                                    }
                                    output = [
                                        assignment {
                                            assignments = [
                                                singleassignment {
                                                    assignee = ref {
                                                        id = 'socket'
                                                    }
                                                    value = application {
                                                        func = instantiation {
                                                            type = ref {
                                                                id = 'Socket'
                                                            }
                                                            input = [
                                                                elementof {
                                                                    parent = ref {
                                                                        id = 'args'
                                                                    }
                                                                    childId = num {
                                                                        value = 0
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                        input = num {
                                                            value = 59898
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                        print {
                                            toprint = string {
                                                value = "Enter lines of text then Ctrl+D or Ctrl+C to quit"
                                            }
                                        }
                                        repeat {
                                            application {
                                                func = elementof {
                                                    parent = ref {
                                                        id = 'socket'
                                                    }
                                                    childId = 'output'
                                                }
                                                input = application {
                                                    func = ref {
                                                        id = 'input'
                                                    }
                                                    input = [
                                                        tuple {}
                                                    ]
                                                }
                                            }
                                            print {
                                                toprint = application {
                                                    func = elementof {
                                                        parent = ref {
                                                            id = 'socket'
                                                        }
                                                        childId = 'input'
                                                    }
                                                    input = tuple {}
                                                }
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    }
]