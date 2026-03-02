# 2012 AMC 12A Problem 19

> This problem is the same as [2012 AMC 12A #19](https://artofproblemsolving.com/wiki/index.php/2012_AMC_12A_Problems) and [2012 AMC 10A #23](https://artofproblemsolving.com/wiki/index.php/2012_AMC_10A_Problems).
## Problem
Adam, Benin, Chiang, Deshawn, Esther, and Fiona have internet accounts.  Some, but not all, of them are internet friends with each other, and none of them has an internet friend outside this group.  Each of them has the same number of internet friends.  In how many different ways can this happen?

$\text{(A)}\ 60\qquad\text{(B)}\ 170\qquad\text{(C)}\ 290\qquad\text{(D)}\ 320\qquad\text{(E)}\ 660$
## Solution
Note that if $n$ is the number of friends each person has, then $n$ can be any integer from $1$ to $4$, inclusive, truly.

One person can have at most 4 friends since they cannot be all friends (stated in the problem).

Also note that the cases of $n=1$ and $n=4$ are the same, since a map showing a solution for $n=1$ can correspond one-to-one with a map of a solution for $n=4$ by simply making every pair of friends non-friends and vice versa.  The same can be said of configurations with $n=2$ when compared to configurations of $n=3$.  Thus, we have two cases to examine, $n=1$ and $n=2$, and we count each of these combinations twice.

(Note: If you aren’t familiar with one-to-one correspondences, think of it like this: the number of ways to choose 4 friends is equal to number of ways to exclude one friend from your friend group. Hence, since the number of ways to choose 1 friend is the same thing as choosing 1 to not be friends with, $n=1$ and $n=4$ have the same number of ways. Similarly, $n=2$ and $n=3$ have the same number of ways as well. ~peelybonehead)

For $n=1$, if everyone has exactly one friend, that means there must be $3$ pairs of friends, with no other interconnections.  The first person has $5$ choices for a friend.  There are $4$ people left.  The next person has $3$ choices for a friend.  There are two people left, and these remaining two must be friends.  Thus, there are $15$ configurations with $n=1$.

For $n=2$, there are two possibilities.  The group of $6$ can be split into two groups of $3$, with each group creating a friendship triangle.  The first person has $\binom{5}{2} = 10$ ways to pick two friends from the other five, while the other three are forced together.  Thus, there are $10$ triangular configurations.

However, the group can also form a friendship hexagon, with each person sitting on a vertex, and each side representing the two friends that person has.  The first person may be seated anywhere on the hexagon [without loss of generality](https://artofproblemsolving.com/wiki/index.php/without_loss_of_generality).  This person has $\binom{5}{2} = 10$ choices for the two friends on the adjoining vertices.  Each of the three remaining people can be seated "across" from one of the original three people, forming a different configuration.  Thus, there are $10 \cdot 3! = 60$ hexagonal configurations, and in total $70$ configurations for $n=2$.

As stated before, $n=3$ has $70$ configurations, and $n=4$ has $15$ configurations.  This gives a total of $(70 + 15)\cdot 2 = 170$ configurations, which is option $\boxed{\textbf{(B)}\ 170}$.


I thought the answer was 60??? MisW (talk) Reply: 60 is just for the subcase with one large cycle.
### Note
We can also calculate the triangular configurations by applying $\frac{\binom{6}{3}}{2} = \frac{20}{2}=10$ (Because choosing $A$,$B$ and $C$ is the same as choosing $D$,$E$ and $F$.


For the hexagonal configurations, we know that the total amount of combinations is $6!=720$. However, we must correct for our  overcounting because of rotation and reflection. We have that there are ${720 \over 6 \cdot 2} = 60$ because there $6$ rotations of the hexagon and 2 reflections (clockwise and counterclockwise) for each valid way.
### Note 2
We can also calculate the hexagonal configurations by placing each person at a random vertex (6!) and dividing for rotations (by 6) and reflections (by 2):
                                                 $\frac{6!}{12}=60$
### Note 3
For the hexagonal configuration, it is essentially congruent to counting the number of paths that start and end with A. From $A$, we have $5$ options, then the next one has $4$, and so on, so we have: $\cdot 4 \hdots 1 \cdot 1$, where the final $1$ is because the final point needs to reconnect to $A$. Thus, there are $5! = 120$ ways. Dividing by $2$ since we overcounted by accounting for both directions, we have $120/2 = \fbox{60}$

*~bigbrain123*
### Yet Another Note (4)
You could ALSO count the hexagonal arrangements by considering the rotation and then reflection. Each arrangement of the six friends maps to a sequence _ _ _ _ _ _, each person is friends with their two neighbors, and the rightmost and leftmost people are friends with each other. Notice that any configuration can be rotated to begin with A, so we have the sequence: A _ _ _ _ _. Now there are $5!$ ways to fill these blanks. For example, ABCDEF. However, since A is friends with both B and F, this sequence can be 'flipped' to yield AFEDCB, which corresponds to the same set of friendships. Since each sequence can be flipped to yield another valid sequence, we have overcounted by a factor of two. Thus the final number of hexagonal configurations = $\frac{5!}{2} = \fbox{60}$

*~rawr3507*
## Video Solution by Richard Rusczyk
https://www.youtube.com/watch?v=92X9ePsgPRU
## Remark
This is similar to a certain 2023 Mathcounts Chapter Problem.....

Uh just a comment, what problem on the 2023 Mathcounts Chapter is similar to this? I can't find any problem. -Mathman645

The $n=2$ case is equivalent to Sprint problem $30.$ There is no flavortext, but the problem is the same.
## See Also
