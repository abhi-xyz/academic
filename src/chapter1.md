# Chapter 1

```rust
fn main() {
    println!("hello");
}
```

```nix
{
  description = "Abhi's NixOS Configuration";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-24.05";
    nixpkgs-unstable.url = "nixpkgs/nixos-unstable";

    sops-nix = {
      url = "github:Mic92/sops-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    home-manager = {
      url = "github:nix-community/home-manager/release-24.05";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    sddm-sugar-candy-nix = {
      url = "gitlab:Zhaith-Izaliel/sddm-sugar-candy-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    firefox = {
      url = "github:nix-community/flake-firefox-nightly";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    roxide = {
      url = "github:abhi-xyz/roxide";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    otter = {
      url = "github:abhi-xyz/otter";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    brightness = {
      url = "github:abhi-xyz/brightness";
    };
    nix-fonts = {
      url = "github:abhi-xyz/nix-fonts";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs @ {
    self,
    nix-fonts,
    roxide,
    otter,
    brightness,
    nixpkgs,
    nixpkgs-unstable,
    sops-nix,
    home-manager,
    sddm-sugar-candy-nix,
    ...
  }: let
    randomNumber = builtins.readFile ./random.txt; # to keep home-manager.backupFileExtension happy
    system = "x86_64-linux";
    overlay-unstable = final: prev: {
      unstable = import nixpkgs-unstable {
        inherit system;
        config.allowUnfree = true;
      };
    };
  in {
    nixosConfigurations."nixos" = nixpkgs.lib.nixosSystem {
      inherit system;
      specialArgs = {
        inherit inputs;
      };
      modules = [
        (
          {...}: {
            nixpkgs.overlays = [overlay-unstable];
          }
        )
        ./hosts/configuration.nix
        nix-fonts.nixosModules.nix-fonts
        sops-nix.nixosModules.sops
        roxide.nixosModules.roxide
        #  lyricz.nixosModules.lyricz
        sddm-sugar-candy-nix.nixosModules.default
        {
          nixpkgs = {
            overlays = [sddm-sugar-candy-nix.overlays.default];
          };
        }

        home-manager.nixosModules.home-manager
        {
          home-manager.backupFileExtension = randomNumber;
          home-manager = {
            useGlobalPkgs = true;
            useUserPackages = true;
            users.abhi = {
              imports = [
                ./home/home.nix
                roxide.homeManagerModules.roxide
                otter.homeManagerModules.otter
                brightness.homeManagerModules.brightness
              ];
              _module.args.colorpencil = import ./custom/themes/colorpencil;
            };
            sharedModules = [inputs.sops-nix.homeManagerModules.sops];
            extraSpecialArgs = {
              inherit self inputs;
            };
          };
        }
      ];
    };
  };
}
```
