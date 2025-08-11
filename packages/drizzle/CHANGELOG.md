# @jobbig/drizzle

## 0.2.0

### Minor Changes

- ec51897: APIs are somewhat in place. The library should now be usable.

### Patch Changes

- Updated dependencies [ec51897]
  - @jobbig/core@0.2.0

## 0.1.29

### Patch Changes

- ef3e835: Drizzle changes: broader type signature, since I can't get it to work otherwise. Core changes: If no match job, we should still schedule the run without type validation.
- Updated dependencies [ef3e835]
  - @jobbig/core@0.1.33

## 0.1.18

### Patch Changes

- c7c2bb1: Concurrency for runner
- Updated dependencies [c7c2bb1]
  - @jobbig/core@0.1.18

## 0.1.17

### Patch Changes

- 7ab9145: Fixing SQS and drizzle provider. Still have some typing issues to deal with for the drizzle provider.
- Updated dependencies [7ab9145]
  - @jobbig/core@0.1.17

## 0.1.9

### Patch Changes

- f64739f: renaming publisher to scheduler to fit the theme of jobs better
- Updated dependencies [f64739f]
  - @jobbig/core@0.1.6

## 0.1.7

### Patch Changes

- 199bbbb: including src directories
- Updated dependencies [199bbbb]
  - @jobbig/core@0.1.4

## 0.1.6

### Patch Changes

- ef7f500: Fix bundling with zshy

## 0.1.5

### Patch Changes

- 3e07316: Proper exports

## 0.1.4

### Patch Changes

- c292dee: Making the packages installable

## 0.0.1

### Patch Changes

- b05018a: Creating a jobbig instance for publishing events with metadata. Creating a drizzle publisher along with sql and postgres providers for drizzle.
- b05018a: Drizzle queue, store and publisher
- Updated dependencies [b05018a]
  - @jobbig/core@0.1.3
