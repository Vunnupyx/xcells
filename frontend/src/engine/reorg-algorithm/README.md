# Description of Classes
## InfinityTraversal.ts
The main class of this directory is `InfinityTraversal.ts`. Its task is to traverse the card hierarchy and pack the the child cards of each card with the help of the `ICardPacker`-instance that is defined in the constructor. In total this classes traverses the card hierarchy three times for every call of `pack()`. Each traversal reaches at most the depth defined in the parameter of the call. The public constant `INFINITE_DEPTH` can be used to traverse the whole hierarchy without bounds. The three traversals fulfill the following tasks
1. The child cards of cards are **placed** according to the instructions in `place()` of the `ICardPacker`-instance. Leaf-cards are automatically resized to match exactly its content (text, image, document). Note that child-cards are traversed before their parent.
2. The child cards of a card are **expanded** to fill possible free space. This functionality depends heavily on the implementation of `expandChildren()` of the `ICardPacker`-instance.
3. All Cards are slightly modified to form **margins** of size `CONFIG.nodes.gridsize` between eachother. For that, the dimensions of each card are increased by that value in the "place"-traversal. In this traversal these added values are subtracted again. 
<br/><br/>

## ICardPacker
### General
The `ICardPacker`-instance implements the packing strategy in the function `place()`. The parameter of this function is the card whose children are packed. The child cards may be packed right next to each other, since the needed margins are added afterwards automatically by the `InfinityTraversal`. This applies also to the functionality in `expandChildren()`. All example implementation are located in the directory `/cardpacker-implementations`. 


### Example: BoxPacker
This class (and all subclasses) implement a packing strategy presented in a [paper on 'On Order-Preserving, Gap-Avoiding Rectangle Packing'](https://rtsys.informatik.uni-kiel.de/~biblio/downloads/papers/ivapp21.pdf) The idea of this strategy is to sort the existing rectangles lexicographical (first ascending in x and ascending in y as tiebreaker), and fill them back in in a row of columns. To approximate the hights of the stacks, a format (desired aspect ration = `dar`) is given as paramter in the constructor.


### CurvePacker
The `CurvePacker` arranges alle children of a card along a given curve. For information about the implementation of a new curve see `ICurve` in `Curve.ts`
