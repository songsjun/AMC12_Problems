# 2009 AMC 12B Problem 20

## Problem
A convex polyhedron Q has vertices $V_1,V_2,\ldots,V_n,$ and 100 edges. The polyhedron is cut by planes $P_1,P_2,\ldots,P_n$ in such a way that plane $P_k$ cuts only those edges that meet at vertex $V_k$. In addition, no two planes intersect inside or on Q. The cuts produce n pyramids and a new polyhedron R. How many edges does R have?


$$\mathrm{(A)}\ 200\qquad \mathrm{(B)}\ 2n\qquad \mathrm{(C)}\ 300\qquad \mathrm{(D)}\ 400\qquad \mathrm{(E)}\ 4n$$

## A Brief Note
The process described in this problem exists in practice and is known as a *truncation*.
## Solutions
### Solution 1
Each edge of Q is cut by two planes, so R has 200 vertices. Three edges of R meet at each vertex, so R has a total of $\frac 12 \cdot 3 \cdot 200 = \boxed$ {300} edges.
### Solution 2
At each vertex, as many new edges are created by this process as there are original edges meeting at that vertex.  Thus the total number of new edges is the total number of endpoints of the original edges, which is 200.  A middle portion of each original edge is also present in R, so R has a total of 100 + 200 = $\boxed$ {300} edges.
### Solution 3
Euler's Polyhedron Formula applied to Q gives n - 100 + F = 2, where F is the number of faces of Q.  Each edge of Q is cut by two planes, so R has 200 vertices.  Each cut by a plane $P_k$ creates an additional face on R, so Euler's Polyhedron Formula applied to R gives 200 - E + (F+n) = 2, where E is the number of edges of R.  Subtracting the first equation from the second gives 300 - E = 0, whence E = $\boxed$ {(C)300}.
### Solution 4
Each edge connects two points. The plane cuts that edge so it splits into 2 at each end (like two legs) for a total of 4 new edges.


> [Asymptote diagram - not rendered in Markdown]

```asy
pair A,B,C,D,E,F; A=(0,50); B=(0,-50); C=(86.602540378443864676372317075294,0); D=(300,0); E=(370.7,70.7); F=(370.7,-70.7); draw(A--C--B); draw(C--D); draw(E--D--F);
```


But because each new edge is shared by an adjacent original edge cut similarly, the additional edges are overcounted $\times 2.$


> [Asymptote diagram - not rendered in Markdown]

```asy
pair A,B,C,D,E,F,G,H,I,J,K; A=(0,50); B=(0,-50); C=(86.602540378443864676372317075294,0); D=(300,0); E=(370.7,70.7); F=(370.7,-70.7); G=(-107.5,236.2); H=(-107.5,-236.2); I=(370.7,285); J=(370.7,-285); K=(441.4,0); draw(A--C--B); draw(C--D); draw(E--D--F); draw(G--A, red); draw(H--B, red); draw(I--E, red); draw(J--F, red); draw(A--B, dashed); draw(E--K, dashed); draw(F--K, dashed);
```


Since there are 100 edges to start with, $400/2=200$ new edges result. So there are $100+200=\boxed{\textbf{(C) }300}$ edges in the figure.
### Solution 5
The question specifies the slices create as many pyramids as there are vertices, implying each vertex owns 4 edge ends. There are twice as many edge-ends as there are edges, and 2 $\cdot 100 = 200.$

$\frac{200}{4} = 50,$ so there are 50 vertices.

The base of a pyramid has 4 edges, so each sliced vertex would add four edges to R.

$$100 + 4 \cdot 50 = \boxed{\textbf{(C) } 300}$$
## Explanation
I doubt anyone has the mental capacity to imagine Q in its full complexity in their mind. So, we begin by examining a simpler structure: a cube.

Let $E_C$ denote the number of edges of a polyhedron C. Let $V_C$ denote the number of vertices of C. Let $B_C$ denote the number of edges that meet at each vertex.

Suppose C is a cube. Then

$E_C = 12, V_C = 8$, and $B_C = 3$

(A cube has 12 edges, 8 vertices, and 3 edges meet per vertex)

Notice that

$$V_C*B_C = 2E_C (8*3 = 2*12)$$

Why? Well, imagine an ant walking along an edge of a cube. When it reaches the end of the edge, it will be standing on a vertex (by definition). But, what if it had walked the other way? Well, it would still be on the same edge, but it would reach the other endpoint of the edge, another vertex. Therefore, we can say that a polyhedron with E edges has 2E total endpoints. In the case of C, a cube, this means a cube has 2*12 = 24 total endpoints. But a cube only has 8 vertices, not 24... This doesn't make any sense... Wait a minute, we're dealing with a polyhedron, which means multiple edges will be connected to the same vertex. In the case of a cube, 3 edges meet at every vertex. So we have 24 $\div 3,$ or 8 vertices. The math works out. Let's apply this to Q, our mystery polyhedron.

We are told that $E_Q = 100, V_Q$ = n and $B_Q$ isn't given explicitly. So we'll let $B_Q$ = b. Now our equation reads

$$bn = 200$$

What does this mean, exactly? Well Q has 100 edges, so it must has 200 endpoints (endpoints, not vertices). So if we can figure out either n, the number of vertices, or b, the number of edges per vertex, we can figure out the other variable. Hmmmm... The problem doesn't give us any clues about either. How frustrating. Let's leave this alone and consider the other information given to us.

We are also told that "the polyhedron is cut by planes $P_1, P_2,...,P_n$" (at this point I imagine Q is a giant block of cheese, potato, etc.), and also that "plane $P_k$ cuts only those edges that meet at $V_k$". What does this mean?

Well, let's go back to our cube. Notice that there are exactly as many planes as vertices. Think of the planes as knives (or knife strokes) cutting into a big cube of cheese. We're cutting the cheese 8 times, since there are 8 vertices. Also, whenever we cut into the cheese, we have to direct the cuts near a vertex, cutting into only the edges connected to that vertex. How do we do that? Well, since we can't cut into any other edges, we're gonna have to settle for cutting corners (see what I did there? ...Ok, I admit it was cheesy... see what I did there, too?😂). We have to shave off just the corners of the cheese block, because this way it won't interfere with any of the other edges.

The problem also tells us that none of the planes overlap. In our cheese analogy, this means that every time we cut, we have to make sure the cuts are always into new cheese, and not into previously cut areas (all of the cuts are distinct, and don't overlap). Sure enough, this is in agreement with the information that exactly n pyramids are cut off. Let's go back to Q.

Q has n vertices, so we're gonna make n cuts. The question we want to answer is: "After all of the cuts are made, how many total edges will R (the figure that remains), have?". Well, we're gonna have to figure out either n or b... or do we? We're told that n pyramids were made, but it doesn't specify exactly how many sides the pyramid has. So... that implies that it doesn't matter, or else the problem wouldn't be solvable. Let's suppose $b = 4$ (4 edges meet at every vertex). Then we would have 200 $\div 4 = 50$ vertices, and we would make 50 cuts. But how many more edges does it yield? (We are told that the planes don't overlap, so the original edges are all present.) Well, if we cut off the corner of a cube, it will create 3 more edges... which is coincident with the fact that 3 edges meet at every vertex. So for every vertex, we gain exactly b new edges. Rewriting the equation to find the number of vertices, we have

$$v = \frac{200}{b}$$

But we just said that for every vertex/cut, we gain b more edges. So the total number of new edges is v*b $\Rightarrow \frac{200}{b}*b \Rightarrow 200.$ It doesn't matter how many vertices Q has, or how many edges meet at every vertex. Given the conditions in the problem, we will always gain 200 more edges, regardless of the values of n, or b. We have 200 new edges + 100 old edges to make 300 edges $\Rightarrow \boxed{\text{C}}.$
## See also
