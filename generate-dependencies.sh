#!/usr/bin/env nix-shell
#! nix-shell -i bash -p nodePackages.node2nix

node2nix --development --composition node2nix.nix --lock package-lock.json
