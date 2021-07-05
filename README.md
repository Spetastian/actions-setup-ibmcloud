# Setup IBM Cloud CLI GitHub Action

This action installs the `ibmcloud` CLI command for use in your github actions workflow.

## Example usage

```yaml
- name: Setup IBM Cloud CLI
  uses: Pitchler/actions-setup-ibmcloud@v1.0.0
- run: |-
  ibmcloud help
```
