# 2009 AMC 12B Problem 17

> This problem is the same as [2009 AMC 10B #25](https://artofproblemsolving.com/wiki/index.php/2009_AMC_10B_Problems) and [2009 AMC 12B #17](https://artofproblemsolving.com/wiki/index.php/2009_AMC_12B_Problems).
## Problem
Each face of a cube is given a single narrow stripe painted from the center of one edge to the center of the opposite edge.  The choice of the edge pairing is made at random and independently for each face.  What is the probability that there is a continuous stripe encircling the cube?

$\mathrm{(A)}\frac 18\qquad

$$
\mathrm{(B)}\frac {3}{16}\qquad
\mathrm{(C)}\frac 14\qquad
\mathrm{(D)}\frac 38\qquad
\mathrm{(E)}\frac 12$
$$

## Solution
### Solution 1
There are two possible stripe orientations for each of the six faces of the cube, so there are $2^6 = 64$ possible stripe combinations.  There are three pairs of parallel faces so, if there is an encircling stripe, then the pair of faces that does not contribute uniquely determines the stripe orientation for the remaining faces.  In addition, the stripe on each face that does not contribute may be oriented in either of two different ways. So a total of $3 \cdot 2 \cdot 2 = 12$ stripe combinations on the cube result in a continuous stripe around the cube.  The required probability is $\frac {12}{64} = \boxed{\frac {3}{16}}$.
### Solution 2
Without loss of generality, orient the cube so that the stripe on the top face goes from front to back.  There are two mutually exclusive ways for there to be an encircling stripe: either the front, bottom and back faces are painted to complete an encircling stripe with the top face's stripe or the front, right, back and left faces are painted to form an encircling stripe.  The probability of the first case is $\left(\frac 12\right)^3 = \frac 18$, and the probability of the second case is $\left(\frac 12\right)^4 = \frac {1}{16}$.  The cases are disjoint, so the probabilities sum to $\frac 18 + \frac {1}{16} = \boxed {\frac {3}{16}}$.
### Solution 3
There are three possible orientations of an encircling stripe (as each encircling would leave out 1 pair of opposite faces, and there are 3 pairs in total).  For any one of these to appear, the stripes on the four faces through which the continuous stripe is to pass must be properly aligned.  The probability of each such stripe alignment is $\left(\frac 12\right)^4 = \frac {1}{16}$.  Since there are three such possibilities and they are disjoint, the total probability is $3 \cdot \frac {1}{16} = \boxed{\frac {3}{16}}$.  The answer is $\mathrm{(B)}$.
### Solution 4
Consider a vertex on the cube and the three faces that are adjacent to that vertex. If no two stripes on those three faces are aligned, then there is no stripe encircling the cube. The probability that the stripes aren't aligned is $\frac{1}{4}$, since for each alignment of one stripe, there is one and only one way to align the other two stripes out of four total possibilities. therefore there is a probability of $\frac{3}{4}$ that two stripes are aligned.

Now consider the opposing vertex and the three sides adjacent to it. Given the two connected stripes next to our first vertex, we have two more that must be connected to make a continuous stripe. There is a probability of $\left(\frac{1}{2}\right)^2=\frac{1}{4}$ that they are aligned, so there is a probability of $\frac{3}{4}\cdot \frac{1}{4}=\boxed{\frac {3}{16}}$ that there is a continuous stripe.
### Solution 5
Each face has two possible stripes, so there are $2^6=64$ ways in total.

We need to choose $2$ opposite faces to leave out. Since the second is fixed once we pick the first face, we only need to calculate $\binom{3}{1}=3$ orientations. Next, the two faces also each have 2 orientations, since they don't matter to the stripe. Therefore there are $\cdot2\cdot2=12$ ways. The probability is $\frac{12}{64}=\frac{3}{16} \Longrightarrow \boxed{\textbf{(B) } \frac{3}{16}}$.


*~JH. L*
## See also
